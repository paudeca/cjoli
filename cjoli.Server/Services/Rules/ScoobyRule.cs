

using cjoli.Server.Models;

namespace cjoli.Server.Services.Rules
{
    public class ScoobyRule : IRule
    {
        public int Win => 3;

        public int Neutral => 2;

        public int Loss => 1;

        public int Forfeit => 0;

        public bool HasPenalty => true;
        public bool HasForfeit => true;

        public Dictionary<int, Score> InitScoreSquad(Squad squad, List<ScoreSquad> scoreSquads)
        {
            return squad.Positions.ToDictionary(p => p.Id, p => new Score() { PositionId = p.Id, TeamId = p.Team?.Id ?? 0 });
        }
    }
}
