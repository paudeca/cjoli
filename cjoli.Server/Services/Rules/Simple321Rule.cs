﻿

using cjoli.Server.Models;

namespace cjoli.Server.Services.Rules
{
    public class Simple321Rule : IRule
    {
        private readonly CJoliService _service;
        public Simple321Rule(CJoliService service)
        {
            _service = service;
        }

        public int Win => 3;

        public int Neutral => 2;

        public int Loss => 1;

        public int Forfeit => 0;

        public bool HasPenalty => false;
        public bool HasForfeit => false;

        public Func<Squad, Comparison<Score>> ScoreComparison => _service.DefaultScoreComparison;

        public Dictionary<int, Score> InitScoreSquad(Squad squad, List<ScoreSquad> scoreSquads)
        {
            return squad.Positions.ToDictionary(p => p.Id, p => new Score() { PositionId = p.Id, TeamId = p.Team?.Id ?? 0 });
        }
    }
}