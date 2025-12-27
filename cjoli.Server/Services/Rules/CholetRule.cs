

using cjoli.Server.Dtos;
using cjoli.Server.Models;

namespace cjoli.Server.Services.Rules
{
    public class CholetRule : IRule
    {
        private readonly CJoliService _service;
        public CholetRule(CJoliService service)
        {
            _service = service;
        }

        public int Win => 3;

        public int Neutral => 2;

        public int Loss => 0;

        public int Forfeit => -2;

        public double GoalFor => 0;

        public bool HasPenalty => true;
        public bool HasForfeit => true;
        public bool HasYoungest => false;

        private List<Breaker> DefaultBreakers = new List<Breaker>() {
                new Breaker { id = "total" },
                new Breaker { id = "direct", children = new List<Breaker>{
                    new Breaker { id = "win" },
                    new Breaker { id = "loss" },
                }},
                new Breaker { id = "goalDiff" },
                new Breaker { id = "goalFor" },
                new Breaker { id = "goalAgainst" },
                new Breaker { id = "penalty" },
            };

        public Func<Phase, Squad?, IRule, Comparison<Score>> ScoreComparison => _service.CustomScoreComparison(DefaultBreakers);


        public Action<Match, MatchDto> ApplyForfeit => (Match match, MatchDto dto) =>
        {
            match.ForfeitA = dto.ForfeitA;
            match.ForfeitB = dto.ForfeitB;
            match.ScoreA = dto.ForfeitA ? 0 : 5;
            match.ScoreB = dto.ForfeitB ? 0 : 5;
        };


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
