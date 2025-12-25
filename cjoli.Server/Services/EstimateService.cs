using cjoli.Server.Dtos;
using cjoli.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace cjoli.Server.Services
{
    public class EstimateService
    {
        public async Task CalculateEstimates(Tourney tourney, ScoresDto scores, User? user, CJoliContext context, CancellationToken ct)
        {
            var userMatches = await context.UserMatch.Where(u => user != null && u.User == user && u.Match != null).ToListAsync(ct);

            var scoreUserA = userMatches.Where(u => u.Match != null).Select(u => CreateScore(u.Match.PositionA, u.Match.PositionB, u.ScoreA, u.ScoreB, u.Match, scores.ScoreSquads, scores.ScorePhases[u.Match.Squad!.Phase.Id]));
            var scoreUserB = userMatches.Where(u => u.Match != null).Select(u => CreateScore(u.Match.PositionB, u.Match.PositionA, u.ScoreB, u.ScoreA, u.Match, scores.ScoreSquads, scores.ScorePhases[u.Match.Squad!.Phase.Id]));
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


            var func = async (int coef, IQueryable<MatchResult> query) =>
            {
                Score score = await query.GroupBy(r => 1).Select(a => SelectScore<int>(coef)(a)).SingleOrDefaultAsync(ct) ?? new Score();
                scoreUsers.ForEach(score.Merge);
                return score;
            };


            Score scoreTotal = await func(coef["total"], queryMatch);
            int totalGame = 1;// scoreTotal.Game;

            Score scoreTotalSeason = await func(coef["totalSeason"] * totalGame, queryMatchSeason);

            var getTeamId = (Team? team) => team?.Alias != null ? team.Alias.Id : team != null ? team.Id : 0;

            var funcMap = async (int coef, IQueryable<MatchResult> query) =>
            {
                var mapScore = await query
                    .Where(r => r.Match.Squad!.Phase.Tourney != tourney)
                    .GroupBy(r => r.Team.Alias != null ? r.Team.Alias.Id : r.Team.Id)
                    .ToDictionaryAsync(kv => kv.Key, kv => SelectScore<int>(coef)(kv), ct) ?? new Dictionary<int, Score>();
                return mapScore;
            };
            var mapAllTeam = await funcMap(coef["allTeam"] * totalGame, queryMatch);
            var mapAllTeamSeason = await funcMap(coef["allTeamSeason"] * totalGame, queryMatchSeason);


            var mapCurrentTeam = await queryMatch
                .Where(r => r.Match.Squad!.Phase.Tourney == tourney)
                .GroupBy(r => r.Team.Id)
                .ToDictionaryAsync(kv => kv.Key, kv => SelectScore<int>(coef["team"] * totalGame)(kv), ct) ?? new Dictionary<int, Score>();

            var funcDirect = async (int coef, IQueryable<MatchResult> query) =>
            {
                var mapScore = await query.Where(r => r.Match.Squad!.Phase.Tourney != tourney && r.TeamAgainst != null)
                    .GroupBy(r => new MyKv { TeamA = r.Team.Alias != null ? r.Team.Alias.Id : r.Team.Id, TeamB = r.TeamAgainst.Alias != null ? r.TeamAgainst.Alias.Id : r.TeamAgainst.Id })
                    .ToDictionaryAsync(kv => kv.Key, kv => SelectScore<MyKv>(coef)(kv), ct);
                return mapScore;
            };
            var mapDirects = await funcDirect(coef["direct"] * totalGame, queryMatch);
            var mapDirectSeasons = await funcDirect(coef["directSeason"] * totalGame, queryMatchSeason);

            var funcOther = async (IQueryable<MatchResult> query) =>
            {
                return await query
                    .GroupBy(r => r.Team)
                    .ToDictionaryAsync(kv => kv.Key, kv => kv.Where(r => r.TeamAgainst != null)
                    .Select(r => r.TeamAgainst.Id).ToList(), ct);
            };
            var mapOtherTeams = await funcOther(queryMatch);
            var mapOtherTeamSeasons = await funcOther(queryMatchSeason);

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

            var funcScore = CalculateScore(scoreList, scoreTotal);

            foreach (var phase in tourney.Phases)
            {
                foreach (var squad in phase.Squads)
                {
                    Func<Match, bool> filter = (Match m) => user == null ? !m.Done : !m.Done || m.UserMatches.Count > 0;
                    foreach (var match in squad.Matches.Where(filter))
                    {
                        CaculateEstimate(match, scores.ScoreSquads, scores.ScorePhases[match.Squad!.Phase.Id], user, funcScore, tourney);
                    }
                }
            }
            context.SaveChanges();
        }



        private Team? FindTeam(Position position, IList<ScoreSquad> squadScores, IList<Score> phaseScores)
        {
            while (position.Team == null && position.ParentPosition != null && (position.ParentPosition.Squad != null || position.ParentPosition.Phase != null))
            {
                IList<Score> scores;
                IEnumerable<Position> positions;
                if (position.ParentPosition.Squad != null)
                {
                    var squad = position.ParentPosition.Squad;
                    positions = squad.Positions;
                    scores = squadScores.Single(s => s.SquadId == squad.Id).Scores;
                }
                else
                {
                    positions = position.Squad?.Phase.Squads.SelectMany(s => s.Positions) ?? new List<Position>();
                    scores = phaseScores;
                }
                var score = scores[position.ParentPosition.Value - 1];
                if (score.Game == 0)
                {
                    break;
                }
                position = positions.Single(s => s.Id == score.PositionId);
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


        private Score CreateScore(Position positionA, Position positionB, int scoreA, int scoreB, Match match, IList<ScoreSquad> scores, IList<Score> phaseScores)
        {
            Team? teamA = FindTeam(positionA, scores, phaseScores);
            Team? teamB = FindTeam(positionB, scores, phaseScores);
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

        private Func<Match, Team, Team, bool, Score> CalculateScore(List<Func<Team, Team, Score>> scoreList, Score scoreTotal)
        {
            return (Match match, Team teamA, Team teamB, bool inverse) =>
            {
                List<Score> scores = scoreList.Select(func => func(teamA, teamB)).ToList();
                Score scoreFinal = scores.Aggregate(new Score(), (acc, score) =>
                {
                    if (score == null || score.Game == 0)
                    {
                        return acc;
                    }
                    double coef = score.Coefficient * (double)scoreTotal.Game / score.Game;
                    acc.Game += Convert.ToInt32(score.Game * coef);
                    acc.Win += Convert.ToInt32(score.Win * coef);
                    acc.Neutral += Convert.ToInt32(score.Neutral * coef);
                    acc.Loss += Convert.ToInt32(score.Loss * coef);
                    acc.GoalFor += Convert.ToInt32(score.GoalFor * coef);
                    acc.GoalAgainst += Convert.ToInt32(score.GoalAgainst * coef);
                    acc.GoalDiff += Convert.ToInt32(score.GoalDiff * coef);
                    return acc;
                });
                return scoreFinal;
            };
        }


        private void CaculateEstimate(Match match, IList<ScoreSquad> scores, IList<Score> phaseScores, User? user, Func<Match, Team, Team, bool, Score> calculateScore, Tourney tourney)
        {
            Team? teamA = FindTeam(match.PositionA, scores, phaseScores);
            Team? teamB = FindTeam(match.PositionB, scores, phaseScores);

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

            var estimatesToDelete = match.Estimates.Where(s => s.User == user).OrderByDescending(s => s.Id).Skip(1);
            if (estimatesToDelete.Count() > 0)
            {
                foreach (var e in estimatesToDelete)
                {
                    match.Estimates.Remove(e);
                }
            }
            MatchEstimate? estimate = match.Estimates.FirstOrDefault(s => s.User == user);
            if (estimate == null)
            {
                estimate = new MatchEstimate() { Match = match };
                match.Estimates.Add(estimate);
            }

            estimate.User = user;
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
