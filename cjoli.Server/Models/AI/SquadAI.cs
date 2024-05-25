namespace cjoli.Server.Models.AI
{
    public class SquadAI
    {
        public required string Name { get; set; }

        public List<PositionAI>? Positions { get; set; }
        public List<MatchAI> Matches { get; set; } = new List<MatchAI>();
    }
}
