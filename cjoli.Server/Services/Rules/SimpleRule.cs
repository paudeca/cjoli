

using cjoli.Server.Dtos;
using cjoli.Server.Models;

namespace cjoli.Server.Services.Rules
{
    public class SimpleRule : IRule
    {
        private readonly CJoliService _service;
        public SimpleRule(CJoliService service)
        {
            _service = service;
        }

        public int Win => 2;

        public int Neutral => 1;

        public int Loss => 0;

        public int Forfeit => 0;

        public double GoalFor => 0;

        public bool HasPenalty => false;
        public bool HasForfeit => false;
        public bool HasYoungest => false;

        public Func<Phase, Squad?, Comparison<Score>> ScoreComparison => _service.DefaultScoreComparison;

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
