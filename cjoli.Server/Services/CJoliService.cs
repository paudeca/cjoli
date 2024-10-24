﻿using AutoMapper;
using cjoli.Server.Dtos;
using cjoli.Server.Exceptions;
using cjoli.Server.Extensions;
using cjoli.Server.Models;
using cjoli.Server.Models.AI;
using cjoli.Server.Services.Rules;
using Microsoft.EntityFrameworkCore;

namespace cjoli.Server.Services
{

    public class CJoliService
    {
        private readonly EstimateService _estimateService;
        private readonly ServerService _serverService;
        private readonly IMapper _mapper;
        private readonly Dictionary<string, IRule> _rules = new Dictionary<string, IRule>();

        public CJoliService(EstimateService estimateService, ServerService serverService, IMapper mapper)
        {
            _estimateService = estimateService;
            _serverService = serverService;
            _mapper = mapper;
            _rules.Add("simple", new SimpleRule());
            _rules.Add("scooby", new ScoobyRule());
            _rules.Add("henderson", new HendersonRule(this));
        }

        public List<Tourney> ListTourneys(CJoliContext context)
        {
            return context.Tourneys.OrderByDescending(t => t.StartTime).ToList().Select(t =>
            {
                t.Config = _rules[t.Rule ?? "scooby"];
                return t;
            }).ToList();
        }

        public List<Team> ListTeams(CJoliContext context)
        {
            return context.Team.OrderBy(t => t.Name).ToList();
        }

        private User GetUserWithConfigMatch(string login, string tourneyUid, CJoliContext context)
        {
            User? user = context.Users
                .Include(u => u.Configs.Where(c => c.Tourney.Uid == tourneyUid)).ThenInclude(c=>c.FavoriteTeam)
                .Include(u => u.UserMatches).SingleOrDefault(u => u.Login == login);
            if (user == null)
            {
                throw new NotFoundException("User", login);
            }
            return user;
        }

        private User? GetUserWithConfig(string? login, string tourneyUid, CJoliContext context)
        {
            return context.Users.Include(u => u.Configs.Where(c => c.Tourney.Uid == tourneyUid)).ThenInclude(c => c.FavoriteTeam).SingleOrDefault(u => u.Login == login);
        }

        private Tourney GetTourney(string tourneyUid, User? user, CJoliContext context)
        {

            bool isAdmin = user.IsAdmin();
            Tourney? tourney = context.Tourneys
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Positions).ThenInclude(p => p.Team)
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Positions).ThenInclude(p => p.ParentPosition)
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Matches).ThenInclude(m => m.UserMatches.Where(u => user != null && !user.IsAdmin() && u.User == user))
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Matches).ThenInclude(
                    m => m.Estimates.Where(s => user != null && user.HasCustomEstimate() ? s.User == user : s.User == null)
                 )
                .Include(t => t.Teams).ThenInclude(t => t.TeamDatas.Where(d => d.Tourney.Uid == tourneyUid))
                .Include(t => t.Teams).ThenInclude(t => t.Alias)
                .FirstOrDefault(t => t.Uid == tourneyUid);
            if (tourney == null)
            {
                throw new NotFoundException("Tourney", tourneyUid);
            }
            tourney.Ranks = context.Tourneys.Include(t => t.Ranks.OrderBy(r => r.Order)).First(t => t.Uid == tourneyUid).Ranks;

            tourney.Config = _rules[tourney.Rule ?? "scooby"];


            return tourney;
        }

        public Tourney GetTourney(string tourneyUid, CJoliContext context)
        {
            return GetTourney(tourneyUid, null, context);
        }


        private Ranking GetRanking(string tourneyUid, string? login, CJoliContext context)
        {
            User? user = GetUserWithConfig(login, tourneyUid, context);
            var tourney = GetTourney(tourneyUid, user, context);
            var scores = CalculateScores(tourney);
            return new Ranking() { Tourney = tourney, Scores = scores };
        }

        public RankingDto CreateRanking(string tourneyUid, string? login, CJoliContext context)
        {
            var ranking = GetRanking(tourneyUid, login, context);
            var dto = _mapper.Map<RankingDto>(ranking);
            AffectationTeams(dto);
            CalculateHistory(dto);
            return dto;
        }

        public void UpdateEstimate(string uuid, string login, CJoliContext context)
        {
            User? user = GetUserWithConfig(login, uuid, context);

            bool isAdmin = user.IsAdmin();
            if (user.IsAdmin())
            {
                user = null;
            }
            Tourney tourney = GetTourney(uuid, user, context);
            var scores = CalculateScores(tourney);
            _estimateService.CalculateEstimates(tourney, scores, user, context);
            if (isAdmin)
            {
                _serverService.UpdateRanking(uuid);
            }
        }

        private Scores CalculateScores(Tourney tourney)
        {
            var scoreTourney = new Score();
            var scoreSquads = new List<ScoreSquad>();
            foreach (var phase in tourney.Phases)
            {
                foreach (var squad in phase.Squads)
                {
                    var scoreSquad = CalculateScoreSquad(squad, scoreTourney, scoreSquads);
                    scoreSquads.Add(scoreSquad);
                }
            }
            return new Scores { ScoreSquads = scoreSquads, ScoreTourney = scoreTourney };
        }

        private ScoreSquad CalculateScoreSquad(Squad squad, Score scoreTourney, List<ScoreSquad> scoreSquads)
        {
            IRule rule = _rules[squad.Phase.Tourney.Rule ?? "scooby"];
            Dictionary<int, Score> scores = rule.InitScoreSquad(squad, scoreSquads);
            squad.Matches.Aggregate(scores, (acc, m) =>
            {
                var userMatch = m.UserMatches.FirstOrDefault();
                if (userMatch == null && !m.Done)
                {
                    return acc;
                }
                IMatch match = m.Done ? m : userMatch!;
                var scoreA = scores[m.PositionA.Id];
                var scoreB = scores[m.PositionB.Id];
                UpdateScore(scoreA, scoreB, scoreTourney, match, rule);
                return scores;
            });
            var listScores = scores.Select(kv => kv.Value).OrderByDescending(x => x.Total).ToList();
            listScores = listScores.Select(s =>
            {
                Position? position = squad.Positions.Single(p => p.Id == s.PositionId);
                s.Total -= position.Penalty;
                s.Penalty = position.Penalty;
                return s;
            }).ToList();

            listScores.Sort((a, b) =>
            {
                var diff = a.Total.CompareTo(b.Total);
                if (diff != 0)
                {
                    return -diff;
                }

                //only if TotalA==TotalB
                var positionA = squad.Positions.Single(p => p.Id == a.PositionId);
                var positionB = squad.Positions.Single(p => p.Id == b.PositionId);
                var match = squad.Matches.LastOrDefault(m => (m.PositionA == positionA && m.PositionB == positionB) || (m.PositionB == positionA && m.PositionA == positionB));
                if (match != null)
                {
                    var userMatch = match.UserMatches.SingleOrDefault();
                    IMatch m = match.Done ? match : userMatch != null ? userMatch : match;
                    if (m.ScoreA > m.ScoreB || m.ForfeitB)
                    {
                        return match.PositionA == positionA ? -1 : 1;
                    }
                    else if (m.ScoreB > m.ScoreA || m.ForfeitA)
                    {
                        return match.PositionB == positionA ? -1 : 1;
                    }
                }
                diff = a.GoalDiff.CompareTo(b.GoalDiff);
                if (diff != 0)
                {
                    return -diff;
                }
                diff = a.GoalFor.CompareTo(b.GoalFor);
                if (diff != 0)
                {
                    return -diff;
                }
                diff = a.GoalAgainst.CompareTo(b.GoalAgainst);
                if (diff != 0)
                {
                    return diff;
                }
                var teamA = positionA.Team;
                var teamB = positionB.Team;
                if (teamA != null && teamB != null)
                {
                    return -teamA.Youngest?.CompareTo(teamB.Youngest) ?? 0;
                }
                return 0;
            });

            var scoreSquad = new ScoreSquad() { SquadId = squad.Id, Scores = listScores };
            return scoreSquad;
        }


        private void AffectationTeams(RankingDto ranking)
        {
            var positions = ranking.Tourney.Phases.SelectMany(p => p.Squads).SelectMany(s => s.Positions);
            foreach (var position in positions.Where(p => p.ParentPosition != null))
            {
                var scoreSquad = ranking.Scores.ScoreSquads.Find(s => s.SquadId == (position.ParentPosition?.SquadId ?? 0));
                var score = scoreSquad?.Scores[(position.ParentPosition?.Value ?? 1) - 1];
                if (score != null && score.Game > 0)
                {
                    var positionParent = positions.Single(p => p.Id == score.PositionId);
                    position.TeamId = positionParent.TeamId;
                }
            }
            var matches = ranking.Tourney.Phases.SelectMany(p => p.Squads).SelectMany(s => s.Matches);
            foreach (var match in matches)
            {
                match.TeamIdA = positions.Single(p => p.Id == match.PositionIdA).TeamId;
                match.TeamIdB = positions.Single(p => p.Id == match.PositionIdB).TeamId;
            }
            foreach (var rank in ranking.Tourney.Ranks)
            {
                var scoreSquad = ranking.Scores.ScoreSquads.Single(s => s.SquadId == rank.SquadId);
                var score = scoreSquad.Scores[rank.Value - 1];
                rank.TeamId = positions.Single(p => p.Id == score.PositionId).TeamId;
            }
        }

        private void CalculateHistory(RankingDto ranking)
        {

            var mapTeams = ranking.Tourney.Teams.ToDictionary(t => t.Id, t => new List<Score>());

            var teams = ranking.Tourney.Teams;
            var positions = ranking.Tourney.Phases.SelectMany(p => p.Squads).SelectMany(s => s.Positions);
            var matches = ranking.Tourney.Phases.SelectMany(p => p.Squads).SelectMany(s => s.Matches).Where(m => m.Done || m.UserMatch != null).OrderBy(m => m.Time);
            matches.Aggregate(mapTeams, (acc, m) =>
            {
                var positionA = positions.SingleOrDefault(p => p.Id == m.PositionIdA);
                var positionB = positions.SingleOrDefault(p => p.Id == m.PositionIdB);
                if (positionA == null || positionB == null)
                {
                    return acc;
                }
                var teamA = teams.SingleOrDefault(t => t.Id == positionA.TeamId);
                var teamB = teams.SingleOrDefault(t => t.Id == positionB.TeamId);
                if (teamA == null || teamB == null)
                {
                    return acc;
                }

                var listA = acc[teamA.Id];
                var listB = acc[teamB.Id];
                var scoreA = new Score() { TeamId = teamA.Id };
                var scoreB = new Score() { TeamId = teamB.Id };

                IMatch match = m.Done ? m : m.UserMatch != null ? m.UserMatch : m;

                IRule rule = _rules[ranking.Tourney.Rule ?? "scooby"];
                UpdateScore(scoreA, scoreB, null, match, rule);

                if (listA.Count > 0)
                {
                    scoreA.Merge(listA.Last());
                }
                if (listB.Count > 0)
                {
                    scoreB.Merge(listB.Last());
                }
                listA.Add(scoreA);
                listB.Add(scoreB);
                return acc;
            });
            var scoreTeams = mapTeams.ToDictionary(kv => kv.Key, kv => kv.Value.LastOrDefault() ?? new Score() { TeamId = kv.Key });
            ranking.History = mapTeams;
            ranking.Scores.ScoreTeams = scoreTeams;
        }

        public void UpdateScore(Score scoreA, Score scoreB, Score? scoreTourney, IMatch match, IRule rule)
        {
            scoreA.Time = match.Time;
            scoreB.Time = match.Time;

            scoreA.Game++;
            scoreB.Game++;
            if (scoreTourney != null)
            {
                scoreTourney.Game++;
            }

            bool isForfeit = match.ForfeitA || match.ForfeitB;
            if (match.ScoreA > match.ScoreB || match.ForfeitB)
            {
                scoreA.Win++;
                scoreB.Loss++;

                scoreA.Total += rule.Win;
                scoreB.Total += match.ForfeitB ? rule.Forfeit : rule.Loss;

                if (scoreTourney != null)
                {
                    scoreTourney.Win++;
                    scoreTourney.GoalFor += match.ScoreA;
                    scoreTourney.GoalAgainst += match.ScoreB;
                    scoreTourney.GoalDiff += match.ScoreA - match.ScoreB;
                    scoreTourney.ShutOut += !isForfeit && match.ScoreB == 0 ? 1 : 0;
                }
            }
            else if (match.ScoreA < match.ScoreB || match.ForfeitA)
            {
                scoreA.Loss++;
                scoreB.Win++;

                scoreA.Total += match.ForfeitA ? rule.Forfeit : rule.Loss;
                scoreB.Total += rule.Win;

                if (scoreTourney != null)
                {
                    scoreTourney.Win++;
                    scoreTourney.GoalFor += match.ScoreB;
                    scoreTourney.GoalAgainst += match.ScoreA;
                    scoreTourney.ShutOut += !isForfeit && match.ScoreA == 0 ? 1 : 0;
                }
            }
            else
            {
                scoreA.Neutral++;
                scoreB.Neutral++;

                scoreA.Total += rule.Neutral;
                scoreB.Total += rule.Neutral;

                if (scoreTourney != null)
                {
                    scoreTourney.Neutral++;
                    scoreTourney.GoalFor += match.ScoreA;
                    scoreTourney.GoalAgainst += match.ScoreB;
                    scoreTourney.ShutOut += !isForfeit && match.ScoreA == 0 ? 1 : 0;
                }
            }
            scoreA.GoalFor += match.ScoreA;
            scoreA.GoalAgainst += match.ScoreB;
            scoreA.GoalDiff += match.ScoreA - match.ScoreB;
            scoreA.ShutOut += !isForfeit && match.ScoreB == 0 ? 1 : 0;

            scoreB.GoalFor += match.ScoreB;
            scoreB.GoalAgainst += match.ScoreA;
            scoreB.GoalDiff += match.ScoreB - match.ScoreA;
            scoreB.ShutOut += !isForfeit && match.ScoreA == 0 ? 1 : 0;

        }


        public void SaveMatch(MatchDto dto, string login, string uuid, CJoliContext context)
        {
            User user = GetUserWithConfigMatch(login, uuid, context);
            Match? match = context.Match
                .Include(m => m.PositionA).ThenInclude(p => p.Team).ThenInclude(t => t.MatchResults)
                .Include(m => m.PositionB).ThenInclude(p => p.Team).ThenInclude(t => t.MatchResults)
                .SingleOrDefault(m => m.Id == dto.Id);
            if (match == null)
            {
                throw new NotFoundException("Match", dto.Id);
            }
            if (user.IsAdmin())
            {
                match.Done = true;
                if (dto.ForfeitA || dto.ForfeitB)
                {
                    match.ForfeitA = dto.ForfeitA;
                    match.ForfeitB = dto.ForfeitB;
                    match.ScoreA = 0;
                    match.ScoreB = 0;
                }
                else
                {
                    match.ScoreA = dto.ScoreA;
                    match.ScoreB = dto.ScoreB;
                }
                SaveMatchResult(match.PositionA, match.PositionB, match, match.ScoreA, match.ScoreB);
                SaveMatchResult(match.PositionB, match.PositionA, match, match.ScoreB, match.ScoreA);
                foreach (var userMatch in context.UserMatch.Where(u => u.Match.Id == match.Id))
                {
                    context.Remove(userMatch);
                }
            }
            else
            {
                UserMatch? userMatch = match.UserMatches.SingleOrDefault(u => u.User == user);
                if (userMatch == null)
                {
                    userMatch = new UserMatch() { Match = match, User = user };
                }
                if (dto.ForfeitA || dto.ForfeitB)
                {
                    userMatch.ForfeitA = dto.ForfeitA;
                    userMatch.ForfeitB = dto.ForfeitB;
                    userMatch.ScoreA = 0;
                    userMatch.ScoreB = 0;
                }
                userMatch.ScoreA = dto.ScoreA;
                userMatch.ScoreB = dto.ScoreB;
                match.UserMatches.Add(userMatch);

            }
            context.SaveChanges();
            if(user.IsAdmin())
            {
                _serverService.UpdateRanking(uuid);
            }
        }

        public void ClearMatch(MatchDto dto, string login, string uuid, CJoliContext context)
        {
            User user = GetUserWithConfigMatch(login, uuid, context);
            Match? match = context.Match
                .Include(m => m.UserMatches.Where(u => u.User == user))
                .Include(m => m.PositionA).ThenInclude(p => p.Team).ThenInclude(t => t.MatchResults)
                .Include(m => m.PositionB).ThenInclude(p => p.Team).ThenInclude(t => t.MatchResults)
                .SingleOrDefault(m => m.Id == dto.Id);
            if (match == null)
            {
                throw new NotFoundException("Match", dto.Id);
            }
            if (user.IsAdmin())
            {
                match.Done = false;
                match.ScoreA = 0;
                match.ScoreB = 0;
                match.ForfeitA = false;
                match.ForfeitB = false;

                foreach (var matchResult in match.MatchResults)
                {
                    context.Remove(matchResult);
                }

            }
            UserMatch? userMatch = match.UserMatches.SingleOrDefault(u => u.User == user);
            if (userMatch != null)
            {
                context.Remove(userMatch);
            }
            context.SaveChanges();
            if (user.IsAdmin())
            {
                _serverService.UpdateRanking(uuid);
            }
        }

        private void SaveMatchResult(Position position, Position positionAgainst, Match match, int scoreA, int scoreB)
        {
            Team? team = position.Team;
            Team? teamAgainst = positionAgainst.Team;
            if (team == null || teamAgainst == null || match.ForfeitA || match.ForfeitB)
            {
                return;
            }
            MatchResult? matchResult = team.MatchResults.SingleOrDefault(m => m.Match == match);
            if (matchResult == null)
            {
                matchResult = new MatchResult() { Team = team, TeamAgainst = teamAgainst, Match = match };
                team.MatchResults.Add(matchResult);
            }
            matchResult.Win = scoreA > scoreB ? 1 : 0;
            matchResult.Neutral = scoreA == scoreB ? 1 : 0;
            matchResult.Loss = scoreA < scoreB ? 1 : 0;
            matchResult.GoalFor = scoreA;
            matchResult.GoalAgainst = scoreB;
            matchResult.GoalDiff = scoreA - scoreB;
            matchResult.ShutOut = scoreB == 0 ? 1 : 0;
        }

        public void SaveUserConfig(string tourneyUid, string login, UserConfigDto dto, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys.Include(t=>t.Teams).SingleOrDefault(t => t.Uid == tourneyUid);
            if (tourney == null)
            {
                throw new NotFoundException("Touney", tourneyUid);
            }
            User? user = GetUserWithConfig(login, tourneyUid, context);
            if (user == null)
            {
                throw new NotFoundException("User", login);
            }
            UserConfig? config = user.Configs.SingleOrDefault(c => c.Id == dto.Id);
            if (config == null)
            {
                config = new UserConfig() { User = user, Tourney = tourney };
                user.Configs.Add(config);
            }
            config.UseCustomEstimate = dto.UseCustomEstimate;
            config.FavoriteTeam = dto.FavoriteTeamId>0?tourney.Teams.Single(t => t.Id == dto.FavoriteTeamId):null;
            context.SaveChanges();
        }


        public void ClearSimulations(int[] ids, string login, string uuid, CJoliContext context)
        {
            User user = GetUserWithConfigMatch(login, uuid, context);
            var userMatches = user.UserMatches.Where(u => ids.Contains(u.Id));
            foreach (var userMatch in userMatches)
            {
                context.Remove(userMatch);
            }
            context.SaveChanges();
        }

        public void UpdatePosition(string uuid, PositionDto positionDto, CJoliContext context)
        {
            Position position = context.Position.Single(p => p.Id == positionDto.Id);
            position.Penalty = positionDto.Penalty;
            context.SaveChanges();
        }

        public Team UpdateTeam(string uuid, TeamDto teamDto, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys.Include(t => t.Teams).ThenInclude(t => t.TeamDatas.Where(d => d.Tourney.Uid == uuid)).SingleOrDefault(t => t.Uid == uuid);
            if (tourney == null)
            {
                throw new NotFoundException("Tourney", uuid);
            }
            Team? team = tourney.Teams.SingleOrDefault(t => t.Id == teamDto.Id);
            if (team == null)
            {
                throw new NotFoundException("Team", teamDto.Id);
            }
            team.Logo = teamDto.Logo ?? team.Logo;
            team.Youngest = teamDto.Youngest ?? team.Youngest;
            team.ShortName = teamDto.ShortName ?? team.ShortName;
            team.FullName = teamDto.FullName ?? team.FullName;
            team.Alias = !string.IsNullOrEmpty(teamDto.Alias) ? context.Team.SingleOrDefault(t => t.Name == teamDto.Alias) : team.Alias;

            TeamData? data = team.TeamDatas.SingleOrDefault();
            if (data == null)
            {
                data = new TeamData() { Team = team, Tourney = tourney };
                team.TeamDatas.Add(data);
            }
            data.Penalty = teamDto.Datas?.Penalty ?? data.Penalty;
            context.SaveChanges();
            return team;
        }

    }
}
