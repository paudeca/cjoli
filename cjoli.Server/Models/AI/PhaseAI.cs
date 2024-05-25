namespace cjoli.Server.Models.AI
{
    public class PhaseAI
    {
        public required string Name { get; set; }

        public List<SquadAI> Squads { get; set; } = new List<SquadAI>();
    }
}
