using cjoli.Server.Datas;
using cjoli.Server.Extensions;
using cjoli.Server.Models;

namespace cjoli.Server.Services
{
    public class EstimateService
    {

        private Team? FindTeam(Position position, List<ScoreSquad> scores)
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


        private Score CreateScore(Position positionA, Position positionB, int scoreA, int scoreB,Match match, List<ScoreSquad> scores)
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

        private Func<Match,Team,Team,bool,Score> CalculateScore(
            Dictionary<int,Score> mapAllTeam,
            Dictionary<int, Score> mapCurrentTeam,
            Dictionary<MyKv, Score> mapDirects,
            Dictionary<Team, List<int>> mapOtherTeams,
            List<Score> scoreUsers,
            Score scoreTotal)
        {
            return (Match match, Team teamA, Team teamB, bool inverse) => {
                Score scoreAllTeam = mapAllTeam.GetValueOrDefault(teamA.Id) ?? new Score();
                Score scoreTeam = mapCurrentTeam.GetValueOrDefault(teamA.Id) ?? new Score();

                List<Score> userScore = scoreUsers.Where(s => s.TeamId == teamA.Id && s.TeamAgainstId == teamB.Id).ToList();

                Score scoreDirect = mapDirects.SingleOrDefault(kv => kv.Key.TeamA == teamA.Id && kv.Key.TeamB == teamB.Id).Value ?? new Score();
                userScore.ForEach(scoreDirect.Merge);

                var otherTeams = mapOtherTeams.SingleOrDefault(m => m.Key.Id == teamB.Id).Value ?? new List<int>();
                var listScoreIndirects = mapDirects.Where(kv => kv.Key.TeamA == teamA.Id && otherTeams.Contains(kv.Key.TeamB));
                var scoreIndirect = listScoreIndirects.Aggregate(new Score() { Coefficient = 1000 }, (acc, item) =>
                {
                    acc.Merge(item.Value);
                    return acc;
                });
                var listUser = scoreUsers.Where(s => s.TeamId == teamA.Id && otherTeams.Contains(s.TeamAgainstId));
                foreach (var u in listUser)
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
        }

        private void CaculateEstimate(Match match, List<ScoreSquad> scores, User? user, Func<Match, Team, Team, bool, Score> calculateScore)
        {
            Position positionA = match.PositionA;
            int i = 0;
            while (i < 5 && positionA.Team == null && positionA.ParentPosition != null)
            {
                i++;
                var squadParent = positionA.ParentPosition.Squad;
                var val = positionA.ParentPosition.Value;
                var scoreParent = scores.Single(s => s.SquadId == squadParent.Id).Scores![val - 1];
                if (scoreParent.Game == 0)
                {
                    break;
                }
                positionA = squadParent.Positions.Single(s => s.Id == scoreParent.PositionId);
            }
            Position positionB = match.PositionB;
            i = 0;
            while (i < 5 && positionB.Team == null && positionB.ParentPosition != null)
            {
                i++;
                var squadParent = positionB.ParentPosition.Squad;
                var val = positionB.ParentPosition.Value;
                var scoreParent = scores.Single(s => s.SquadId == squadParent.Id).Scores![val - 1];
                if (scoreParent.Game == 0)
                {
                    break;
                }
                positionB = squadParent.Positions.Single(s => s.Id == scoreParent.PositionId);
            }
            Team? teamA = positionA.Team;
            Team? teamB = positionB.Team;
            if (teamA == null || teamB == null)
            {
                return;
            }
            Score scoreA = calculateScore(match, teamA, teamB, false);
            Score scoreB = calculateScore(match, teamB, teamA, true);

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
            
            estimate.User = user.IsAdmin() ? null : user;
            estimate.ScoreA = (int)Math.Round(goalA);
            estimate.ScoreB = (int)Math.Round(goalB);

            if(estimate.ScoreA==estimate.ScoreB)
            {
                if(winA>winB)
                {
                    var delta = goalDiffA - goalDiffB;
                    estimate.ScoreA = (int)Math.Round(goalA+delta);
                } else
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

        public void CalculateEstimates(Tourney tourney, List<ScoreSquad> scores, User? user, CJoliContext context)
        {
            var userMatches = context.UserMatch.Where(u => u.User == user).ToList();

            var scoreUserA = userMatches.Select(u => CreateScore(u.Match.PositionA, u.Match.PositionB, u.ScoreA, u.ScoreB, u.Match, scores));
            var scoreUserB = userMatches.Select(u => CreateScore(u.Match.PositionB, u.Match.PositionA, u.ScoreB, u.ScoreA, u.Match, scores));
            var scoreUsers = scoreUserA.Concat(scoreUserB).ToList();

            Score scoreTotal = context.MatchResult.GroupBy(r => 1).Select(SelectScore<int>(1)).SingleOrDefault() ?? new Score();
            scoreUsers.ForEach(scoreTotal.Merge);


            var mapAllTeam = context.MatchResult.GroupBy(r => r.Team.Id).ToDictionary(kv => kv.Key, kv => SelectScore<int>(10)(kv)) ?? new Dictionary<int, Score>();
            var mapCurrentTeam = context.MatchResult.Where(r => r.Match.Squad!.Phase.Tourney == tourney).GroupBy(r => r.Team.Id).ToDictionary(kv => kv.Key, kv => SelectScore<int>(1000)(kv)) ?? new Dictionary<int, Score>();
            var mapDirects = context.MatchResult.Where(r=>r.TeamAgainst!=null).GroupBy(r => new MyKv{ TeamA=r.Team.Id, TeamB=r.TeamAgainst.Id}).ToDictionary(kv=>kv.Key,kv=>SelectScore<MyKv>(10000)(kv));
            var mapOtherTeams = context.MatchResult.GroupBy(r => r.Team).ToDictionary(kv => kv.Key, kv => kv.Where(r=>r.TeamAgainst!=null).Select(r=>r.TeamAgainst.Id).ToList());

            scoreUsers.GroupBy(s => s.TeamId).ToList().ForEach(scores =>
            {
                int key = scores.Key;
                foreach (var score in scores)
                {
                    if (mapAllTeam.ContainsKey(key))
                    {
                        mapAllTeam[key].Merge(score);
                    }
                    else
                    {
                        score.Coefficient = 1;
                        mapAllTeam.Add(key, score);
                    }
                    if (mapCurrentTeam.ContainsKey(key))
                    {
                        mapCurrentTeam[key].Merge(score);
                    }
                    else
                    {
                        score.Coefficient = 100;
                        mapCurrentTeam.Add(key, score);
                    }
                }
            });

            var funcScore = CalculateScore(mapAllTeam, mapCurrentTeam, mapDirects, mapOtherTeams, scoreUsers, scoreTotal);

            foreach (var phase in tourney.Phases)
            {
                foreach (var squad in phase.Squads)
                {
                    Func<Match, bool> filter = (Match m) => user == null ? !m.Done : !m.Done || m.UserMatches.Count > 0;
                    foreach (var match in squad.Matches.Where(filter))
                    {
                        CaculateEstimate(match, scores, user, funcScore);
                    }
                }
            }
            context.SaveChanges();
        }

    }

    public class MyKv
    {
        public int TeamA;
        public int TeamB;
    }
}
