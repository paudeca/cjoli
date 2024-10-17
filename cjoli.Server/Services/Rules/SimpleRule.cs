

using cjoli.Server.Models;

namespace cjoli.Server.Services.Rules
{
    public class SimpleRule : IRule
    {
        public int Win => 2;

        public int Neutral => 1;

        public int Loss => 0;

        public int Forfeit => 0;

        public bool HasPenalty => false;

        public Dictionary<int, Score> InitScoreSquad(Squad squad, List<ScoreSquad> scoreSquads)
        {
            return squad.Positions.ToDictionary(p => p.Id, p => new Score() { PositionId = p.Id, TeamId = p.Team?.Id ?? 0 });
        }
    }
}
