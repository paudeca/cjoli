

using cjoli.Server.Dtos;
using cjoli.Server.Models;
using cjoli.Server.Models.Tournify;
using System.Text.Json;

namespace cjoli.Server.Services.Rules
{
    public class TournifyRule : IRule
    {
        private readonly CJoliService _service;
        private readonly TourneyTournify _tourney;
        public TournifyRule(CJoliService service, Tourney tourney)
        {
            _service = service;
            _tourney = JsonSerializer.Deserialize<TourneyTournify>(tourney.RuleConfig!)!;
        }

        public int Win => string.IsNullOrEmpty(_tourney.pointsWin) ? 3 : int.Parse(_tourney.pointsWin);

        public int Neutral => string.IsNullOrEmpty(_tourney.pointsTie) ? 1 : int.Parse(_tourney.pointsTie);

        public int Loss => string.IsNullOrEmpty(_tourney.pointsLoss) ? 0 : int.Parse(_tourney.pointsLoss);

        public int Forfeit => 0;

        public double GoalFor => 0;

        public bool HasPenalty => false;
        public bool HasForfeit => false;
        public bool HasYoungest => false;


        private static int CompareItem(Score a, Score b, Func<Score, double> get, SourceType source, bool orderAsc, Func<double, double, double> getValue)
        {
            var valA = get(a);
            var valB = get(b);
            var diff = valA.CompareTo(valB);
            if (diff != 0)
            {
                if (orderAsc)
                {
                    CJoliService.UpdateSource(a, b, source, getValue(valA, valB), orderAsc);
                    return -diff;
                }
                else
                {
                    CJoliService.UpdateSource(a, b, source, getValue(valA, valB), !orderAsc);
                    return diff;
                }
            }
            return 0;
        }

        private Dictionary<string, Func<Score, Score, int>> compares = new Dictionary<string, Func<Score, Score, int>> {
            { "points", (a, b) => CompareItem(a,b,s=>s.Total,SourceType.total, true, (valA,valB)=>valA-valB) },
            { "goalDifference", (a, b) => CompareItem(a,b,s=>s.GoalDiff,SourceType.goalDiff, true, (valA,valB)=>valA-valB) },
            { "goalsScored", (a, b) => CompareItem(a,b,s=>s.GoalFor,SourceType.goalFor, true, (valA,valB)=>valA-valB) },
            { "numMatchesWon", (a, b) => CompareItem(a,b,s=>s.Win,SourceType.win, true, (valA,valB)=>valA-valB) },
            { "cleanSheets", (a, b) => CompareItem(a,b,s=>s.ShutOut,SourceType.shutOut, true, (valA,valB)=>valA-valB) },
            { "goalsConceded", (a, b) => CompareItem(a,b,s=>s.GoalAgainst,SourceType.goalAgainst, false, (valA,valB)=>valB-valA) },
            { "pointsAverage", (a, b) => CompareItem(a,b,s=>s.Total/s.Game,SourceType.avg, true, (valA,valB)=>valA-valB) },
        };



        private int CompareTiebreakers(List<TieBreakerTournify> breakers, Score a, Score b, Func<Score, Score, int> callHeadToHead)
        {
            foreach (var breaker in breakers)
            {
                var id = breaker.id!;
                if (id == "headToHead")
                {
                    var diff = callHeadToHead(a, b);
                    if (diff != 0)
                    {
                        return diff;
                    }
                }
                else if (compares.ContainsKey(id))
                {
                    var func = compares[id]!;
                    var diff = func(a, b);
                    if (diff != 0)
                    {
                        return diff;
                    }
                }
            }
            return 0;
        }


        public Func<Phase, Squad?, IRule, Comparison<Score>> ScoreComparison => (Phase phase, Squad? squad, IRule rule) => (Score a, Score b) =>
        {
            var positions = squad?.Positions ?? phase.Squads.SelectMany(s => s.Positions).ToList();
            var matches = squad?.Matches ?? phase.Squads.SelectMany(s => s.Matches).ToList();

            var positionA = positions.Single(p => p.Id == a.PositionId);
            var positionB = positions.Single(p => p.Id == b.PositionId);

            Func<Score, Score, int> callHeadToHead = (Score a, Score b) =>
            {
                var matchesDirect = matches.OrderBy(m => m.Time)
                    .Where(m => (m.PositionA == positionA && m.PositionB == positionB) || (m.PositionB == positionA && m.PositionA == positionB)).ToList();
                var scores = new Dictionary<int, Score>() { { positionA.Id, new Score() }, { positionB.Id, new Score() } };
                var m = matchesDirect.Aggregate(scores, (acc, m) =>
                {
                    var userMatch = m.UserMatches.OrderByDescending(u => u.LogTime).FirstOrDefault(u => u.User != null);
                    IMatch match = m.Done ? m : userMatch != null ? userMatch : m;

                    var scoreA = scores[m.PositionA.Id];
                    var scoreB = scores[m.PositionB.Id];
                    _service.UpdateScore(scoreA, scoreB, null, match, m, this);
                    return acc;
                });
                var scoreA = scores[positionA.Id];
                var scoreB = scores[positionB.Id];
                return scoreA.Win > scoreB.Win ? -1 : scoreA.Loss > scoreB.Loss ? 1 : 0;
            };

            var breakers = new List<TieBreakerTournify>() {
                new TieBreakerTournify { id = "points" },
                new TieBreakerTournify { id = "goalDifference" },
                new TieBreakerTournify { id = "goalsScored" },
                new TieBreakerTournify { id = "headToHead", subCriteria = new List<TieBreakerTournify>{
                    new TieBreakerTournify { id = "points" },
                    new TieBreakerTournify { id = "goalDifference" },
                    new TieBreakerTournify { id = "goalsScored" },
               } },
            };
            if (_tourney.tiebreakers != null)
            {
                breakers = _tourney.tiebreakers;
            }

            var diff = CompareTiebreakers(breakers, a, b, callHeadToHead);
            if (diff != 0)
            {
                return diff;
            }
            return _service.DefaultScoreComparison(phase, squad, rule)(a, b);
        };

        public Action<Match, MatchDto> ApplyForfeit => _service.DefaultApplyForfeit;

        public Dictionary<int, Score> InitScoreSquad(Squad squad, List<ScoreSquad> scoreSquads, Dictionary<int, List<Score>> scorePhases, User? user)
        {
            return squad.Positions.ToDictionary(p => p.Id, p => new Score() { PositionId = p.Id, TeamId = p.Team?.Id ?? 0 });
        }

        public double Total(CJoliService.ScoreType type, double total, int score)
        {
            return _service.Total(type, this, total, score);
        }

    }
}
