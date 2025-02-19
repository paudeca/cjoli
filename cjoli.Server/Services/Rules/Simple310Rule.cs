

using cjoli.Server.Dtos;
using cjoli.Server.Models;

namespace cjoli.Server.Services.Rules
{
    public class Simple310Rule : IRule
    {
        private readonly CJoliService _service;
        public Simple310Rule(CJoliService service)
        {
            _service = service;
        }

        public int Win => 3;

        public int Neutral => 1;

        public int Loss => 0;

        public int Forfeit => 0;

        public bool HasPenalty => false;
        public bool HasForfeit => false;

        public Func<Squad, Comparison<Score>> ScoreComparison => _service.DefaultScoreComparison;
        public Action<Match, MatchDto> ApplyForfeit => _service.DefaultApplyForfeit;

        public Dictionary<int, Score> InitScoreSquad(Squad squad, List<ScoreSquad> scoreSquads, User? user)
        {
            return squad.Positions.ToDictionary(p => p.Id, p => new Score() { PositionId = p.Id, TeamId = p.Team?.Id ?? 0 });
        }
    }
}
