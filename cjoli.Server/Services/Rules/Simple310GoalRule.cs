﻿

using cjoli.Server.Dtos;
using cjoli.Server.Models;
using static cjoli.Server.Services.CJoliService;

namespace cjoli.Server.Services.Rules
{
    public class Simple310GoalRule : IRule
    {
        private readonly CJoliService _service;
        public Simple310GoalRule(CJoliService service)
        {
            _service = service;
        }

        public int Win => 3;

        public int Neutral => 1;

        public int Loss => 0;

        public int Forfeit => 0;

        public double GoalFor => 0.1;

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
            switch (type)
            {
                case ScoreType.Win:
                    return Math.Round(total + Win + score * GoalFor, 1);
                case ScoreType.Loss:
                    return Math.Round(total + Loss + score * GoalFor, 1);
                case ScoreType.Neutral:
                    return Math.Round(total + Neutral + score * GoalFor, 1);
                case ScoreType.Forfeit:
                    return Math.Round(total + Forfeit, 1);
            }
            return total;
        }

    }
}
