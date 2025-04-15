

using cjoli.Server.Dtos;
using cjoli.Server.Models;
using static cjoli.Server.Services.CJoliService;
using System.Data;

namespace cjoli.Server.Services.Rules
{
    public class NordCupRule : IRule
    {
        private readonly CJoliService _service;
        public NordCupRule(CJoliService service)
        {
            _service = service;
        }

        public int Win => 3;

        public int Neutral => 1;

        public int Loss => 0;

        public int Forfeit => 0;

        public double GoalFor => 0.1;

        public bool HasPenalty => true;
        public bool HasForfeit => false;
        public bool HasYoungest => false;

        public Func<Phase, Squad?, Comparison<Score>> ScoreComparison => (Phase phase, Squad? squad) => (Score a, Score b) =>
        {
            var positions = squad?.Positions ?? phase.Squads.SelectMany(s => s.Positions).ToList();
            var matches = squad?.Matches ?? phase.Squads.SelectMany(s => s.Matches).ToList();

            var positionA = positions.Single(p => p.Id == a.PositionId);
            var positionB = positions.Single(p => p.Id == b.PositionId);


            var diff = a.Total.CompareTo(b.Total);
            if (diff != 0)
            {
                UpdateSource(a, b, SourceType.total, a.Total - b.Total, true);
                return -diff;
            }

            var match = matches.OrderBy(m => m.Time).LastOrDefault(m => (m.PositionA == positionA && m.PositionB == positionB) || (m.PositionB == positionA && m.PositionA == positionB));
            if (match != null)
            {
                var userMatch = match.UserMatches.FirstOrDefault(u => u.User != null);
                IMatch m = match.Done ? match : userMatch != null ? userMatch : match;
                if (m.ScoreA > m.ScoreB || m.ForfeitB)
                {
                    int result = match.PositionA == positionA ? -1 : 1;
                    UpdateSource(a, b, SourceType.direct, -result, true);
                    return result;
                }
                else if (m.ScoreB > m.ScoreA || m.ForfeitA)
                {
                    int result = match.PositionB == positionA ? -1 : 1;
                    UpdateSource(a, b, SourceType.direct, -result, true);
                    return result;
                }
            }

            diff = a.Penalty.CompareTo(b.Penalty);
            if (diff != 0)
            {
                UpdateSource(a, b, SourceType.penalty, b.Penalty - a.Penalty, false);
                return diff;
            }
            diff = a.GoalDiff.CompareTo(b.GoalDiff);
            if (diff != 0)
            {
                UpdateSource(a, b, SourceType.goalDiff, a.GoalDiff - b.GoalDiff, true);
                return -diff;
            }
            diff = a.GoalFor.CompareTo(b.GoalFor);
            if (diff != 0)
            {
                UpdateSource(a, b, SourceType.goalFor, a.GoalFor - b.GoalFor, true);
                return -diff;
            }
            diff = a.GoalAgainst.CompareTo(b.GoalAgainst);
            if (diff != 0)
            {
                UpdateSource(a, b, SourceType.goalAgainst, b.GoalAgainst - a.GoalAgainst, false);
                return diff;
            }


            return _service.DefaultScoreComparison(phase, squad)(a, b);
        };


        public Action<Match, MatchDto> ApplyForfeit => _service.DefaultApplyForfeit;

        public Dictionary<int, Score> InitScoreSquad(Squad squad, List<ScoreSquad> scoreSquads, Dictionary<int, List<Score>> scorePhases, User? user)
        {
            return squad.Positions.ToDictionary(p => p.Id, p => new Score() { PositionId = p.Id, TeamId = p.Team?.Id ?? 0 });
        }

        public double Total(CJoliService.ScoreType type, double total, int score)
        {
            switch (type)
            {
                case ScoreType.Win:
                    return Math.Round(total + Win + score * GoalFor,1);
                case ScoreType.Loss:
                    return Math.Round(total + Loss + score * GoalFor, 1);
                case ScoreType.Neutral:
                    return Math.Round(total + Neutral + score * GoalFor, 1);
                case ScoreType.Forfeit:
                    return Math.Round(total + Forfeit,1);
            }
            return total;

        }

    }
}
