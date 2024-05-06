using cjoli.Server.Datas;
using cjoli.Server.Dtos;
using cjoli.Server.Exceptions;
using cjoli.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace cjoli.Server.Services
{

    public class CJoliService
    {

        public List<Tourney> ListTourneys(CJoliContext context)
        {
            return context.Tourneys.OrderBy(t => t.StartTime).ToList();
        }

        private User GetUser(string login, CJoliContext context)
        {
            User? user = context.Users.Include(u=>u.Configs).SingleOrDefault(u => u.Login == login);
            if (user == null)
            {
                throw new NotFoundException("User", login);
            }
            return user;
        }

        public Tourney GetTourney(string tourneyUid, User? user, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Positions).ThenInclude(p => p.Team)
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Positions).ThenInclude(p => p.ParentPosition)
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Matches).ThenInclude(m => m.UserMatches.Where(u => u.User == user))
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Matches).ThenInclude(m => m.Simulations
                    .Where(s=>s.User==user && s.User!.Configs.Any(c=>c.Tourney.Uid==tourneyUid && c.UseCustomSimulation) || s.User == null))
                .Include(t => t.Teams)
                .FirstOrDefault(t => t.Uid == tourneyUid);
            if (tourney == null)
            {
                throw new NotFoundException("Tourney", tourneyUid);
            }

            return tourney;
        }

        public Ranking GetRanking(string tourneyUid, string? login, CJoliContext context)
        {
            User? user = context.Users.Include(u=>u.Configs).ThenInclude(u=>u.Tourney).SingleOrDefault(u => u.Login == login);
            var tourney = GetTourney(tourneyUid, user, context);
            var scores = CalculateScores(tourney);
            //var simulations = CalculateSimulations(tourney, context);
            return new Ranking() { Tourney = tourney, Scores = scores};
        }

        private Func<IGrouping<T, MatchResult>, Score> SelectScore<T>(int coefficient) {
            return (IGrouping<T, MatchResult> o) =>
            {
                return new Score
                {
                    Game = o.Count(),
                    Win = o.Sum(m => m.Win),
                    Neutral = o.Sum(m => m.Neutral),
                    Loss = o.Sum(m => m.Loss),
                    GoalFor = o.Sum(m => m.GoalFor),
                    GoalAgainst = o.Sum(m => m.GoalAgainst),
                    GoalDiff = o.Sum(m => m.GoalDiff),
                    Coefficient = coefficient
                };
            };
        }


        public void UpdateSimulation(string uuid, string login, CJoliContext context)
        {
            User? user = context.Users.Single(u => u.Login == login);
            if(user.Role=="Admin")
            {
                user = null;
            }
            Tourney tourney = GetTourney(uuid, user, context);
            var scores = CalculateScores(tourney);
            CalculateSimulations(tourney, scores, user, context);
        }

        private void CalculateSimulations(Tourney tourney, List<ScoreSquad> scores, User? user, CJoliContext context)
        {
            var userMatches = context.UserMatch.Where(u => u.User == user);
            var scoreUserA = userMatches.Select(u => new Score() { 
                TeamId=u.Match.PositionA.Team!.Id,
                TeamAgainstId = u.Match.PositionB.Team!.Id,
                MatchId=u.Match.Id,
                PositionId=u.Match.PositionA.Id, 
                Game = 1, 
                Win = u.ScoreA > u.ScoreB ? 1 : 0, 
                Neutral = u.ScoreA == u.ScoreB ? 1 : 0, 
                Loss = u.ScoreA < u.ScoreB ? 1 : 0, 
                GoalFor = u.ScoreA, 
                GoalAgainst = u.ScoreB, 
                GoalDiff = u.ScoreA - u.ScoreB
            });
            var scoreUserB = userMatches.Select(u => new Score() { 
                TeamId=u.Match.PositionB.Team!.Id,
                TeamAgainstId=u.Match.PositionA.Team!.Id,
                MatchId=u.Match.Id,
                PositionId=u.Match.PositionB.Id,
                Game = 1, 
                Win = u.ScoreB > u.ScoreA ? 1 : 0, 
                Neutral = u.ScoreB == u.ScoreA ? 1 : 0, 
                Loss = u.ScoreB < u.ScoreA ? 1 : 0, 
                GoalFor = u.ScoreB, 
                GoalAgainst = u.ScoreA, 
                GoalDiff = u.ScoreB - u.ScoreA
            });
            var scoreUsers = scoreUserA.Concat(scoreUserB).ToList();

            Score scoreTotal = context.MatchResult.GroupBy(r => 1).Select(SelectScore<int>(1)).SingleOrDefault() ?? new Score();
            scoreUsers.ForEach(scoreTotal.Merge);


            var mapAllTeam = context.MatchResult.GroupBy(r => r.Team.Id).ToDictionary(kv=>kv.Key, kv=>SelectScore<int>(10)(kv)) ?? new Dictionary<int, Score>();
            var mapCurrentTeam = context.MatchResult.Where(r=>r.Match.Squad!.Phase.Tourney==tourney).GroupBy(r => r.Team.Id).ToDictionary(kv => kv.Key, kv => SelectScore<int>(1000)(kv)) ?? new Dictionary<int, Score>();

            scoreUsers.GroupBy(s => s.TeamId).ToList().ForEach(s =>
            {
                foreach(var score in s)
                {
                    if(mapAllTeam.ContainsKey(s.Key))
                    {
                        mapAllTeam[s.Key].Merge(score);
                    } else
                    {
                        score.Coefficient = 1;
                        mapAllTeam.Add(s.Key, score);
                    }
                    if(mapCurrentTeam.ContainsKey(s.Key))
                    {
                        mapCurrentTeam[s.Key].Merge(score);
                    } else
                    {
                        score.Coefficient = 100;
                        mapCurrentTeam.Add(s.Key, score);
                    }
                }
            });

            var CalculateScore = (Match match, Team teamA, Team teamB,bool inverse) =>
            {
                Score scoreAllTeam = mapAllTeam.GetValueOrDefault(teamA.Id) ?? new Score();
                Score scoreTeam = mapCurrentTeam.GetValueOrDefault(teamA.Id) ?? new Score();

                Score? userScore = scoreUsers.SingleOrDefault(s => s.TeamId == teamA.Id && s.TeamAgainstId==teamB.Id);

                Score scoreDirect = context.MatchResult.Where(m => m.Team == teamA && m.TeamAgainst == teamB).GroupBy(r => 1).Select(SelectScore<int>(10000)).SingleOrDefault() ?? new Score();
                if(userScore!=null)
                {
                    scoreDirect.Merge(userScore);
                }

                var list = context.MatchResult.Where(m => m.Team == teamB).Select(m => m.TeamAgainst).ToList();
                Score scoreIndirect = context.MatchResult.Where(m => m.Team == teamA && list.Contains(m.TeamAgainst)).GroupBy(r => 1).Select(SelectScore<int>(1000)).SingleOrDefault() ?? new Score();
                var listUser = scoreUsers.Where(s => s.TeamId == teamA.Id && list.Select(t => t.Id).Contains(s.TeamAgainstId));
                foreach(var u in listUser)
                {
                    scoreIndirect.Merge(u);
                }

                Score?[] scores = { scoreDirect, scoreIndirect, scoreTeam, scoreAllTeam, scoreTotal };
                Score scoreFinal = scores.Aggregate(new Score(), (acc, score) =>
                {
                    if (score == null)
                    {
                        return acc;
                    }
                    acc.Game += score.Game * score.Coefficient;
                    acc.Win += score.Win * score.Coefficient;
                    acc.Neutral += score.Neutral * score.Coefficient;
                    acc.Loss += score.Loss * score.Coefficient;
                    acc.GoalFor += score.GoalFor * score.Coefficient;
                    acc.GoalAgainst += score.GoalAgainst * score.Coefficient;
                    acc.GoalDiff += score.GoalDiff * score.Coefficient;
                    return acc;
                });
                return scoreFinal;
            };

            foreach (var phase in tourney.Phases)
            {
                foreach(var squad in phase.Squads)
                {
                    Func<Match, bool> filter = (Match m) => user == null ? !m.Done : !m.Done || m.UserMatches.Count>0;
                    foreach(var match in squad.Matches.Where(filter))
                    {
                        Position positionA = match.PositionA;
                        int i = 0;
                        while(i<5 && positionA.Team==null && positionA.ParentPosition!=null)
                        {
                            i++;
                            var squadParent = positionA.ParentPosition.Squad;
                            var val = positionA.ParentPosition.Value;
                            var scoreParent = scores.Single(s => s.SquadId == squadParent.Id).Scores![val - 1];
                            if(scoreParent.Game==0)
                            {
                                break;
                            }
                            positionA = squadParent.Positions.Single(s=>s.Id==scoreParent.PositionId);
                        }
                        Position positionB = match.PositionB;
                        i = 0;
                        while (i<5 && positionB.Team == null && positionB.ParentPosition != null)
                        {
                            i++;
                            var squadParent = positionB.ParentPosition.Squad;
                            var val = positionB.ParentPosition.Value;
                            var scoreParent = scores.Single(s => s.SquadId == squadParent.Id).Scores![val-1];
                            if (scoreParent.Game == 0)
                            {
                                break;
                            }
                            positionB = squadParent.Positions.Single(s => s.Id == scoreParent.PositionId);
                        }
                        Team? teamA = positionA.Team;
                        Team? teamB = positionB.Team;
                        if(teamA == null || teamB==null)
                        {
                            continue;
                        }
                        Score scoreA = CalculateScore(match, teamA, teamB, false);
                        Score scoreB = CalculateScore(match, teamB, teamA, true);

                        var goalForA = (double)scoreA.GoalFor / scoreA.Game;
                        var goalAgainstA = (double)scoreA.GoalAgainst / scoreA.Game;
                        var goalDiffA = (double)scoreA.GoalDiff / scoreA.Game;

                        var goalForB = (double)scoreB.GoalFor / scoreB.Game;
                        var goalAgainstB = (double)scoreB.GoalAgainst / scoreB.Game;
                        var goalDiffB = (double)scoreB.GoalDiff / scoreB.Game;

                        var goalA = (goalForA + goalAgainstB) / 2;
                        var goalB = (goalForB + goalAgainstA) / 2;

                        MatchSimulation? simul = match.Simulations.FirstOrDefault(s=>s.User==user);
                        if(simul==null)
                        {
                            simul = new MatchSimulation() { Match = match };
                            match.Simulations.Add(simul);
                        }
                        simul.User = user;
                        simul.ScoreA = (int)goalA;
                        simul.ScoreB = (int)goalB;
                    }
                }
            }
            context.SaveChanges();
        }



        private List<ScoreSquad> CalculateScores(Tourney tourney)
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
            return scoreSquads;
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

                scoreB.GoalFor += match.ScoreB;
                scoreB.GoalAgainst += match.ScoreA;
                scoreB.GoalDiff += match.ScoreB - match.ScoreA;


                return scores;
            });
            var listScores = scores.Select(kv => kv.Value).OrderByDescending(x => x.Total).ToList();
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
            var scoreSquad = new ScoreSquad() { SquadId = squad.Id, Scores = listScores };
            return scoreSquad;
        }

        /*public void Simulation(string uuid, string login, int squadId, CJoliContext context)
        {
            User? user = context.Users.SingleOrDefault(u => u.Login == login);
            if (user == null)
            {
                throw new NotFoundException("User", login);
            }
            Squad? squad = context.Squad
                .Include(s=>s.Matches).ThenInclude(m=>m.UserMatches.Where(u=>u.User==user))
                .Include(s=>s.Positions).ThenInclude(p=>p.Team)
                .SingleOrDefault(s => s.Id == squadId);
            if(squad==null)
            {
                throw new NotFoundException("Squad", squadId);
            }

            foreach(var match in squad.Matches.Where(m=>m.UserMatches.Count==0))
            {
                UserMatch userMatch = new UserMatch() { Match = match, User=user };
                Position positionA = match.PositionA;
                Position positionB = match.PositionB;
                Team? teamA = positionA.Team;
                Team? teamB = positionB.Team;


                match.UserMatches.Add(userMatch);
            }
            context.SaveChanges();
        }*/

        public void AffectationTeams(RankingDto ranking)
        {
            var positions = (ranking.Tourney.Phases ?? []).SelectMany(p => p.Squads ?? []).SelectMany(s => s.Positions ?? []);
            foreach (var position in positions.Where(p => p.ParentPosition != null))
            {
                var scoreSquad = ranking.Scores.Find(s => s.SquadId == (position.ParentPosition?.SquadId ?? 0));
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
            User user = GetUser(login, context);
            Match? match = context.Match
                .Include(m => m.PositionA).ThenInclude(p=>p.Team).ThenInclude(t=>t.MatchResults)
                .Include(m => m.PositionB).ThenInclude(p => p.Team).ThenInclude(t=>t.MatchResults)
                .SingleOrDefault(m => m.Id == dto.Id);
            if (match == null)
            {
                throw new NotFoundException("Match", dto.Id);
            }
            if (user.Role=="ADMIN")
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
                foreach(var userMatch in context.UserMatch.Where(u=>u.Match.Id == match.Id))
                {
                    context.Remove(userMatch);
                }
            } else
            {
                UserMatch? userMatch = match.UserMatches.SingleOrDefault(u=>u.User == user);
                if (userMatch == null)
                {
                    userMatch = new UserMatch() { Match = match, User = user };
                }
                if(dto.ForfeitA || dto.ForfeitB)
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
            User user = GetUser(login, context);
            Match? match = context.Match
                .Include(m=>m.UserMatches.Where(u=>u.User==user))
                .Include(m => m.PositionA).ThenInclude(p => p.Team).ThenInclude(t => t.MatchResults)
                .Include(m => m.PositionB).ThenInclude(p => p.Team).ThenInclude(t => t.MatchResults)
                .SingleOrDefault(m => m.Id == dto.Id);
            if (match == null)
            {
                throw new NotFoundException("Match", dto.Id);
            }
            if(user.Role=="ADMIN")
            {
                match.Done = false;
                match.ScoreA = 0;
                match.ScoreB = 0;
                match.ForfeitA = false;
                match.ForfeitB = false;

                foreach(var matchResult in match.MatchResults)
                {
                    context.Remove(matchResult);
                }

            }
            UserMatch? userMatch = match.UserMatches.SingleOrDefault(u => u.User == user);
            if(userMatch!=null)
            {
                context.Remove(userMatch);
            }
            context.SaveChanges();
        }

        private void SaveMatchResult(Position position, Position positionAgainst, Match match, int scoreA, int scoreB)
        {
            Team? team = position.Team;
            Team? teamAgainst = positionAgainst.Team;
            if (team == null || teamAgainst==null || match.ForfeitA || match.ForfeitB)
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
        }



        public void ClearSimulations(int[] ids, string login, CJoliContext context)
        {
            User user = GetUser(login, context);
            var  userMatches = user.UserMatches.Where(u => ids.Contains(u.Id));
            foreach(var userMatch in userMatches)
            {
                context.Remove(userMatch);
            }
            context.SaveChanges();
        }


        public void UpdateTeam(string uuid, TeamDto teamDto, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys.Include(t => t.Teams).SingleOrDefault(t => t.Uid == uuid);
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
            context.SaveChanges();

        }

        public void SaveUserConfig(string tourneyUid, string login, UserConfigDto dto, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys.SingleOrDefault(t=>t.Uid==tourneyUid);
            if(tourney==null)
            {
                throw new NotFoundException("Touney", tourneyUid);
            }
            User user = GetUser(login, context);
            UserConfig? config = user.Configs.SingleOrDefault(c => c.Id == dto.Id);
            if(config==null)
            {
                config = new UserConfig() { User = user, Tourney = tourney };
                user.Configs.Add(config);
            }
            config.ActiveSimulation = dto.ActiveSimulation;
            config.UseCustomSimulation = dto.UseCustomSimulation;
            context.SaveChanges();
        }

    }

    public class Ranking
    {
        public required Tourney Tourney { get; set; }
        public required List<ScoreSquad> Scores { get; set; }
        //public required List<Simulation> Simulations { get; set; }
    }

    public class ScoreSquad
    {
        public int SquadId { get; set; }
        public List<Score>? Scores { get; set; }

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

        public void Merge(Score score)
        {
            Game += score.Game;
            Win += score.Win;
            Neutral += score.Neutral;
            Loss+= score.Loss;
            GoalFor += score.GoalFor;
            GoalAgainst += score.GoalAgainst;
            GoalDiff += score.GoalDiff;
        }
    }

    public class Simulation
    {
        public int MatchId { get; set; }
        public int ScoreA { get; set; }
        public int ScoreB { get; set; }
    }
}
