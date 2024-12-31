using cjoli.Server.Extensions;
using cjoli.Server.Models;

namespace cjoli.Server.Services
{
    public class EstimateService
    {


        public void CalculateEstimates(Tourney tourney, Scores scores, User? user, CJoliContext context)
        {
            var userMatches = context.UserMatch.Where(u => u.User == user).ToList();

            var scoreUserA = userMatches.Select(u => CreateScore(u.Match.PositionA, u.Match.PositionB, u.ScoreA, u.ScoreB, u.Match, scores.ScoreSquads));
            var scoreUserB = userMatches.Select(u => CreateScore(u.Match.PositionB, u.Match.PositionA, u.ScoreB, u.ScoreA, u.Match, scores.ScoreSquads));
            var scoreUsers = scoreUserA.Concat(scoreUserB).ToList();

            var queryMatch = context.MatchResult.Where(r => r.Match.Squad!.Phase.Tourney.Category == tourney.Category);
            var queryMatchSeason = queryMatch.Where(r => r.Match.Squad!.Phase.Tourney.Season == tourney.Season);

            Dictionary<string, int> coef = new Dictionary<string, int> {
                { "total", 0 },
                { "totalSeason", 0 },
                { "allTeam",0 },
                {"allTeamSeason",0 },
                {"team",0 },
                {"indirect",0 },
                {"indirectSeason", 0 },
                {"direct",0 },
                {"directSeason",0 },
                {"user" ,0}
            };

            coef["total"] = 1;
            coef["totalSeason"] = coef["total"] * 2;
            coef["allTeam"] = coef["totalSeason"] * 2;
            coef["allTeamSeason"] = coef["allTeam"] * 2;
            coef["team"] = coef["allTeamSeason"] * 2;
            coef["indirect"] = coef["team"] * 2;
            coef["indirectSeason"] = coef["indirect"] * 2;
            coef["direct"] = coef["indirectSeason"] * 2;
            coef["directSeason"] = coef["direct"] * 2;
            coef["user"] = coef["directSeason"] * 2;


            var func = (int coef, IQueryable<MatchResult> query) =>
            {
                Score score = query.GroupBy(r => 1).Select(SelectScore<int>(coef)).SingleOrDefault() ?? new Score();
                scoreUsers.ForEach(score.Merge);
                return score;
            };


            Score scoreTotal = func(coef["total"], queryMatch);
            int totalGame = scoreTotal.Game;

            Score scoreTotalSeason = func(coef["totalSeason"] * totalGame, queryMatchSeason);

            var getTeamId = (Team? team) => team?.Alias != null ? team.Alias.Id : team != null ? team.Id : 0;

            var funcMap = (int coef, IQueryable<MatchResult> query) =>
            {
                var mapScore = query
                    .Where(r => r.Match.Squad!.Phase.Tourney != tourney)
                    .GroupBy(r => r.Team.Alias != null ? r.Team.Alias.Id : r.Team.Id)
                    .ToDictionary(kv => kv.Key, kv => SelectScore<int>(coef)(kv)) ?? new Dictionary<int, Score>();
                return mapScore;
            };
            var mapAllTeam = funcMap(coef["allTeam"] * totalGame, queryMatch);
            var mapAllTeamSeason = funcMap(coef["allTeamSeason"] * totalGame, queryMatchSeason);


            var mapCurrentTeam = queryMatch
                .Where(r => r.Match.Squad!.Phase.Tourney == tourney)
                .GroupBy(r => r.Team.Id)
                .ToDictionary(kv => kv.Key, kv => SelectScore<int>(coef["team"] * totalGame)(kv)) ?? new Dictionary<int, Score>();

            var funcDirect = (int coef, IQueryable<MatchResult> query) =>
            {
                var mapScore = query.Where(r => r.Match.Squad!.Phase.Tourney != tourney && r.TeamAgainst != null)
                    .GroupBy(r => new MyKv { TeamA = r.Team.Alias != null ? r.Team.Alias.Id : r.Team.Id, TeamB = r.TeamAgainst.Alias != null ? r.TeamAgainst.Alias.Id : r.TeamAgainst.Id })
                    .ToDictionary(kv => kv.Key, kv => SelectScore<MyKv>(coef)(kv));
                return mapScore;
            };
            var mapDirects = funcDirect(coef["direct"] * totalGame, queryMatch);
            var mapDirectSeasons = funcDirect(coef["directSeason"] * totalGame, queryMatchSeason);

            var funcOther = (IQueryable<MatchResult> query) =>
            {
                return query
                    .GroupBy(r => r.Team)
                    .ToDictionary(kv => kv.Key, kv => kv.Where(r => r.TeamAgainst != null)
                    .Select(r => r.TeamAgainst.Id).ToList());
            };
            var mapOtherTeams = funcOther(queryMatch);
            var mapOtherTeamSeasons = funcOther(queryMatchSeason);

            var MergeScore = (Dictionary<int, Score> map, int key, Score score, int coefficient) =>
            {
                if (map.ContainsKey(key))
                {
                    map[key].Merge(score);
                }
                else
                {
                    score.Coefficient = coefficient;
                    map.Add(key, score);
                }
            };

            scoreUsers.GroupBy(s => s.TeamId).ToList().ForEach(scores =>
            {
                int key = scores.Key;
                foreach (var score in scores)
                {
                    //MergeScore(mapAllTeam, getTeamId(context.Team.SingleOrDefault(t=>t.Id==key)), score, 10);
                    //MergeScore(mapAllTeamSeason, getTeamId(context.Team.SingleOrDefault(t => t.Id == key)), score, 100);
                    MergeScore(mapCurrentTeam, key, score, coef["user"] * totalGame);
                }
            });

            List<Func<Team, Team, Score>> scoreList = [
                (Team teamA, Team teamB)=>scoreTotal,
                (Team teamA, Team teamB)=>scoreTotalSeason,
                (Team teamA, Team teamB)=>mapAllTeam.GetValueOrDefault(getTeamId(teamA))?? new Score(),
                (Team teamA, Team teamB)=>mapAllTeamSeason.GetValueOrDefault(getTeamId(teamA))?? new Score(),
                (Team teamA, Team teamB)=>mapCurrentTeam.GetValueOrDefault(teamA.Id)?? new Score(),
                (Team teamA, Team teamB)=>{
                    var score = mapDirects.SingleOrDefault(kv => kv.Key.TeamA == getTeamId(teamA) && kv.Key.TeamB == getTeamId(teamB)).Value ?? new Score();
                    List<Score> userScore = scoreUsers.Where(s => s.TeamId == teamA.Id && s.TeamAgainstId == teamB.Id).ToList();
                    userScore.ForEach(score.Merge);
                    return score;
                },
                (Team teamA, Team teamB)=>{
                    var score = mapDirectSeasons.SingleOrDefault(kv => kv.Key.TeamA == getTeamId(teamA) && kv.Key.TeamB == getTeamId(teamB)).Value ?? new Score();
                    List<Score> userScore = scoreUsers.Where(s => s.TeamId == teamA.Id && s.TeamAgainstId == teamB.Id).ToList();
                    userScore.ForEach(score.Merge);
                    return score;
                },
                (Team teamA, Team teamB)=>{
                    var otherTeams = mapOtherTeams.SingleOrDefault(m => m.Key.Id == teamB.Id).Value ?? new List<int>();
                    var listScoreIndirects = mapDirects.Where(kv => kv.Key.TeamA == teamA.Id && otherTeams.Contains(kv.Key.TeamB));
                    var score = listScoreIndirects.Aggregate(new Score() { Coefficient = coef["indirect"] }, (acc, item) =>
                    {
                        acc.Merge(item.Value);
                        return acc;
                    });
                    var listUser = scoreUsers.Where(s => s.TeamId == teamA.Id && otherTeams.Contains(s.TeamAgainstId));
                    foreach (var u in listUser)
                    {
                        score.Merge(u);
                    }
                    return score;
                },
                (Team teamA, Team teamB)=>{
                    var otherTeams = mapOtherTeamSeasons.SingleOrDefault(m => m.Key.Id == teamB.Id).Value ?? new List<int>();
                    var listScoreIndirects = mapDirectSeasons.Where(kv => kv.Key.TeamA == teamA.Id && otherTeams.Contains(kv.Key.TeamB));
                    var score = listScoreIndirects.Aggregate(new Score() { Coefficient = coef["indirectSeason"] }, (acc, item) =>
                    {
                        acc.Merge(item.Value);
                        return acc;
                    });
                    var listUser = scoreUsers.Where(s => s.TeamId == teamA.Id && otherTeams.Contains(s.TeamAgainstId));
                    foreach (var u in listUser)
                    {
                        score.Merge(u);
                    }
                    return score;
                },
             ];

            var funcScore = CalculateScore(scoreList);

            foreach (var phase in tourney.Phases)
            {
                foreach (var squad in phase.Squads)
                {
                    Func<Match, bool> filter = (Match m) => user == null ? !m.Done : !m.Done || m.UserMatches.Count > 0;
                    foreach (var match in squad.Matches.Where(filter))
                    {
                        CaculateEstimate(match, scores.ScoreSquads, user, funcScore, tourney);
                    }
                }
            }
            context.SaveChanges();
        }



        private Team? FindTeam(Position position, IList<ScoreSquad> scores)
        {
            while (position.Team == null && position.ParentPosition != null && position.ParentPosition.Squad != null)
            {
                var squad = position.ParentPosition.Squad;
                var score = scores.Single(s => s.SquadId == squad.Id).Scores![position.ParentPosition.Value - 1];
                if (score.Game == 0)
                {
                    break;
                }
                position = squad.Positions.Single(s => s.Id == score.PositionId);
            }
            return position.Team;
        }

        private Func<IGrouping<T, MatchResult>, Score> SelectScore<T>(int coefficient)
        {
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


        private Score CreateScore(Position positionA, Position positionB, int scoreA, int scoreB, Match match, IList<ScoreSquad> scores)
        {
            Team? teamA = FindTeam(positionA, scores);
            Team? teamB = FindTeam(positionB, scores);
            return new Score()
            {
                TeamId = teamA?.Id ?? 0,
                TeamAgainstId = teamB?.Id ?? 0,
                MatchId = match.Id,
                PositionId = positionA.Id,
                Game = 1,
                Win = scoreA > scoreB ? 1 : 0,
                Neutral = scoreA == scoreB ? 1 : 0,
                Loss = scoreA < scoreB ? 1 : 0,
                GoalFor = scoreA,
                GoalAgainst = scoreB,
                GoalDiff = scoreA - scoreB
            };
        }

        private Func<Match, Team, Team, bool, Score> CalculateScore(List<Func<Team, Team, Score>> scoreList)
        {
            return (Match match, Team teamA, Team teamB, bool inverse) =>
            {
                List<Score> scores = scoreList.Select(func => func(teamA, teamB)).ToList();
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
        }

        private Position FindParentPosition(Position position, IList<ScoreSquad> scores)
        {
            while (position.Team == null && position.ParentPosition != null)
            {
                var squadParent = position.ParentPosition.Squad;
                var val = position.ParentPosition.Value;
                var scoreSquad = scores.SingleOrDefault(s => s.SquadId == squadParent.Id);
                if (scoreSquad == null)
                {
                    break;
                }
                var scoreParent = scoreSquad.Scores[val - 1];
                if (scoreParent.Game == 0)
                {
                    break;
                }
                position = squadParent.Positions.Single(s => s.Id == scoreParent.PositionId);
            }
            return position;
        }

        private void CaculateEstimate(Match match, IList<ScoreSquad> scores, User? user, Func<Match, Team, Team, bool, Score> calculateScore, Tourney tourney)
        {
            Position positionA = FindParentPosition(match.PositionA, scores);
            Position positionB = FindParentPosition(match.PositionB, scores);

            Team? teamA = positionA.Team;
            Team? teamB = positionB.Team;
            if (teamA == null || teamB == null)
            {
                return;
            }
            Score scoreA = calculateScore(match, teamA, teamB, false);
            Score scoreB = calculateScore(match, teamB, teamA, true);
            if (scoreA.Game == 0)
            {
                scoreA.Game = 1;
            }
            if (scoreB.Game == 0)
            {
                scoreB.Game = 1;
            }

            var goalForA = (double)scoreA.GoalFor / scoreA.Game;
            var goalAgainstA = (double)scoreA.GoalAgainst / scoreA.Game;
            var goalDiffA = (double)scoreA.GoalDiff / scoreA.Game;

            var goalForB = (double)scoreB.GoalFor / scoreB.Game;
            var goalAgainstB = (double)scoreB.GoalAgainst / scoreB.Game;
            var goalDiffB = (double)scoreB.GoalDiff / scoreB.Game;

            var goalA = (goalForA + goalAgainstB) / 2;
            var goalB = (goalForB + goalAgainstA) / 2;

            var winA = (double)scoreA.Win / scoreA.Game;
            var winB = (double)scoreB.Win / scoreB.Game;

            MatchEstimate? estimate = match.Estimates.FirstOrDefault(s => s.User == user);
            if (estimate == null)
            {
                estimate = new MatchEstimate() { Match = match };
                match.Estimates.Add(estimate);
            }

            estimate.User = user.IsAdmin(tourney.Uid) ? null : user;
            estimate.ScoreA = (int)Math.Round(goalA);
            estimate.ScoreB = (int)Math.Round(goalB);

            if (estimate.ScoreA == estimate.ScoreB)
            {
                if (winA > winB)
                {
                    var delta = goalDiffA - goalDiffB;
                    estimate.ScoreA = (int)Math.Round(goalA + delta);
                }
                else
                {
                    var delta = goalDiffB - goalDiffA;
                    estimate.ScoreB = (int)Math.Round(goalB + delta);
                }
            }

            if (match.Shot && estimate.ScoreA == estimate.ScoreB)
            {
                if (goalA > goalB)
                {
                    estimate.ScoreA++;
                }
                else
                {
                    estimate.ScoreB++;
                }
            }
        }
    }

    public class MyKv
    {
        public int TeamA;
        public int TeamB;
    }
}
