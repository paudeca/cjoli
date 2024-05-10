using cjoli.Server.Datas;
using cjoli.Server.Dtos;
using cjoli.Server.Exceptions;
using cjoli.Server.Extensions;
using cjoli.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace cjoli.Server.Services
{

    public class CJoliService
    {
        private readonly EstimateService _estimateService;

        public CJoliService(EstimateService estimateService)
        {
            _estimateService = estimateService;
        }

        public List<Tourney> ListTourneys(CJoliContext context)
        {
            return context.Tourneys.OrderBy(t => t.StartTime).ToList();
        }

        private User GetUserWithConfigMatch(string login, CJoliContext context)
        {
            User? user = context.Users.Include(u => u.Configs).Include(u => u.UserMatches).SingleOrDefault(u => u.Login == login);
            if (user == null)
            {
                throw new NotFoundException("User", login);
            }
            return user;
        }

        private User? GetUserWithConfig(string? login, string tourneyUid, CJoliContext context)
        {
            return context.Users.Include(u => u.Configs.Where(c => c.Tourney.Uid == tourneyUid)).SingleOrDefault(u => u.Login == login);
        }

        public Tourney GetTourney(string tourneyUid, User? user, CJoliContext context)
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
                .FirstOrDefault(t => t.Uid == tourneyUid);
            if (tourney == null)
            {
                throw new NotFoundException("Tourney", tourneyUid);
            }
            tourney.Ranks = context.Tourneys.Include(t => t.Ranks.OrderBy(r => r.Order)).First(t => t.Uid == tourneyUid).Ranks;

            return tourney;
        }

        public Ranking GetRanking(string tourneyUid, string? login, CJoliContext context)
        {
            User? user = GetUserWithConfig(login, tourneyUid, context);
            var tourney = GetTourney(tourneyUid, user, context);
            var scores = CalculateScores(tourney);
            return new Ranking() { Tourney = tourney, Scores = scores };
        }

        public Ranking GetShortRanking(string tourneyUid, CJoliContext context)
        {
            var tourney = context.Tourneys
                .Include(t=>t.Teams)
                .Single(t => t.Uid == tourneyUid);
            var scores = CalculateScores(tourney);
            return new Ranking() { Tourney = tourney, Scores = scores };
        }


        public void UpdateEstimate(string uuid, string login, CJoliContext context)
        {
            User? user = GetUserWithConfig(login, uuid, context);

            if (user.IsAdmin())
            {
                user = null;
            }
            Tourney tourney = GetTourney(uuid, user, context);
            var scores = CalculateScores(tourney);
            _estimateService.CalculateEstimates(tourney, scores, user, context);
        }

        private Scores CalculateScores(Tourney tourney)
        {
            var scoreSquads = new List<ScoreSquad>();
            foreach (var phase in tourney.Phases)
            {
                foreach (var squad in phase.Squads)
                {
                    var scoreSquad = CalculateScoreSquad(squad);
                    scoreSquads.Add(scoreSquad);
                }
            }
            var scoreTeams = scoreSquads.Aggregate(new Dictionary<int, Score>(), (acc, scoreSquad) =>
            {
                return scoreSquad.TeamScores?.Aggregate(acc, (acc, kv) =>
                {
                    Score? score = acc.GetValueOrDefault(kv.Key);
                    if (score == null)
                    {
                        score = new Score();
                        acc.Add(kv.Key, score);
                    }
                    score.Merge(kv.Value);
                    return acc;
                }) ?? acc;
            });
            return new Scores { ScoreSquads = scoreSquads, ScoreTeams = scoreTeams };
        }

        private ScoreSquad CalculateScoreSquad(Squad squad)
        {
            Dictionary<int, Score> scores = squad.Positions.ToDictionary(p => p.Id, p => new Score() { PositionId = p.Id, TeamId = p.Team?.Id ?? 0 });
            squad.Matches.Aggregate(scores, (acc, m) =>
            {
                var userMatch = m.UserMatches.FirstOrDefault();
                if (userMatch == null && !m.Done)
                {
                    return acc;
                }
                IMatch? match = m.Done ? m : userMatch;
                if (match == null)
                {
                    return acc;
                }
                var scoreA = scores[m.PositionA.Id];
                var scoreB = scores[m.PositionB.Id];
                scoreA.Game++;
                scoreB.Game++;

                bool isForfeit = match.ForfeitA || match.ForfeitB;
                if (match.ScoreA > match.ScoreB || match.ForfeitB)
                {
                    scoreA.Win++;
                    scoreB.Loss++;

                    scoreA.Total += 3;
                    scoreB.Total += match.ForfeitB ? 0 : 1;
                }
                else if (match.ScoreA < match.ScoreB || match.ForfeitA)
                {
                    scoreA.Loss++;
                    scoreB.Win++;

                    scoreA.Total += match.ForfeitA ? 0 : 1;
                    scoreB.Total += 3;
                }
                else
                {
                    scoreA.Neutral++;
                    scoreB.Neutral++;

                    scoreA.Total += 2;
                    scoreB.Total += 2;
                }
                scoreA.GoalFor += match.ScoreA;
                scoreA.GoalAgainst += match.ScoreB;
                scoreA.GoalDiff += match.ScoreA - match.ScoreB;
                scoreA.ShutOut += !isForfeit && match.ScoreB == 0 ? 1 : 0;

                scoreB.GoalFor += match.ScoreB;
                scoreB.GoalAgainst += match.ScoreA;
                scoreB.GoalDiff += match.ScoreB - match.ScoreA;
                scoreB.ShutOut += !isForfeit && match.ScoreA == 0 ? 1 : 0;


                return scores;
            });
            var listScores = scores.Select(kv => kv.Value).OrderByDescending(x => x.Total).ToList();
            listScores = listScores.Select(s =>
            {
                Position position = squad.Positions.Single(p => p.Id == s.PositionId);
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
                var positionA = squad.Positions.Single(p => p.Id == a.PositionId);
                var positionB = squad.Positions.Single(p => p.Id == b.PositionId);
                var match = squad.Matches.SingleOrDefault(m => (m.PositionA == positionA && m.PositionB == positionB) || (m.PositionB == positionA && m.PositionA == positionB));
                if ((match != null))
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

            var teamScores = scores.Where(kv =>
            {
                var position = squad.Positions.Single(p => p.Id == kv.Key);
                return position.Team != null;
            }).ToDictionary(kv => kv.Key, kv => kv.Value);

            var scoreSquad = new ScoreSquad() { SquadId = squad.Id, Scores = listScores, TeamScores = teamScores };
            return scoreSquad;
        }


        public void AffectationTeams(RankingDto ranking)
        {
            var positions = (ranking.Tourney.Phases ?? []).SelectMany(p => p.Squads ?? []).SelectMany(s => s.Positions ?? []);
            foreach (var position in positions.Where(p => p.ParentPosition != null))
            {
                var scoreSquad = ranking.Scores.ScoreSquads.Find(s => s.SquadId == (position.ParentPosition?.SquadId ?? 0));
                var score = (scoreSquad?.Scores ?? [])[(position.ParentPosition?.Value ?? 1) - 1];
                if (score.Game > 0)
                {
                    var positionParent = positions.Single(p => p.Id == score.PositionId);
                    position.TeamId = positionParent.TeamId;
                }
            }
        }

        public void SaveMatch(MatchDto dto, string login, CJoliContext context)
        {
            User user = GetUserWithConfigMatch(login, context);
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
        }

        public void ClearMatch(MatchDto dto, string login, CJoliContext context)
        {
            User user = GetUserWithConfigMatch(login, context);
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



        public void ClearSimulations(int[] ids, string login, CJoliContext context)
        {
            User user = GetUserWithConfigMatch(login, context);
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
                throw new NotFoundException("Tou    rney", uuid);
            }
            Team? team = tourney.Teams.SingleOrDefault(t => t.Id == teamDto.Id);
            if (team == null)
            {
                throw new NotFoundException("Team", teamDto.Id);
            }
            team.Logo = teamDto.Logo ?? team.Logo;
            team.Youngest = teamDto.Youngest ?? team.Youngest;

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

        public void SaveUserConfig(string tourneyUid, string login, UserConfigDto dto, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys.SingleOrDefault(t => t.Uid == tourneyUid);
            if (tourney == null)
            {
                throw new NotFoundException("Touney", tourneyUid);
            }
            User user = GetUserWithConfig(login, tourneyUid, context);
            UserConfig? config = user.Configs.SingleOrDefault(c => c.Id == dto.Id);
            if (config == null)
            {
                config = new UserConfig() { User = user, Tourney = tourney };
                user.Configs.Add(config);
            }
            config.ActiveEstimate = dto.ActiveEstimate;
            config.UseCustomEstimate = dto.UseCustomEstimate;
            context.SaveChanges();
        }

    }

    public class Ranking
    {
        public required Tourney Tourney { get; set; }
        public required Scores Scores { get; set; }
    }

    public class Scores
    {
        public List<ScoreSquad> ScoreSquads { get; set; } = new List<ScoreSquad>();
        public Dictionary<int, Score>? ScoreTeams { get; set; }
    }

    public class ScoreSquad
    {
        public int SquadId { get; set; }
        public List<Score>? Scores { get; set; }
        public Dictionary<int, Score>? TeamScores { get; set; }

    }

    public class Score
    {
        public int PositionId { get; set; }
        public int MatchId { get; set; }
        public int TeamId { get; set; }
        public int TeamAgainstId { get; set; }
        public int Game { get; set; }
        public int Win { get; set; }
        public int Neutral { get; set; }
        public int Loss { get; set; }
        public int Total { get; set; }
        public int GoalFor { get; set; }
        public int GoalAgainst { get; set; }
        public int GoalDiff { get; set; }
        public int Coefficient { get; set; }
        public int ShutOut { get; set; }
        public int Penalty { get; set; }

        public void Merge(Score score)
        {
            Total += score.Total;
            Game += score.Game;
            Win += score.Win;
            Neutral += score.Neutral;
            Loss += score.Loss;
            GoalFor += score.GoalFor;
            GoalAgainst += score.GoalAgainst;
            GoalDiff += score.GoalDiff;
            ShutOut += score.ShutOut;
            Penalty += score.Penalty;
        }
    }
}
