

using cjoli.Server.Dtos;
using cjoli.Server.Models;
using static cjoli.Server.Services.CJoliService;


namespace cjoli.Server.Services.Rules
{
    public class Simple310AverageRule : IRule
    {
        private readonly CJoliService _service;
        public Simple310AverageRule(CJoliService service)
        {
            _service = service;
        }

        public int Win => 3;

        public int Neutral => 1;

        public int Loss => 0;

        public int Forfeit => 0;

        public double GoalFor => 0;

        public bool HasPenalty => false;
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
            diff = a.GoalDiff.CompareTo(b.GoalDiff);
            if (diff != 0)
            {
                UpdateSource(a, b, SourceType.goalDiff, a.GoalDiff - b.GoalDiff, true);
                return -diff;
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
            return _service.Total(type, this, total, score);
        }

    }
}
