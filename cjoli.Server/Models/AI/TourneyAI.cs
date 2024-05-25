namespace cjoli.Server.Models.AI
{
    public class TourneyAI
    {
        public required string Name { get; set; }
        public required string Uid {  get; set; }
        public required string Season { get; set; }
        public required string Category { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public List<PhaseAI> Phases { get; set; } = new List<PhaseAI>();
        public List<TeamAI> Teams { get; set; } = new List<TeamAI>();
        public List<RankAI> Ranks { get; set; } = new List<RankAI>();
        public List<ScoreAI> Scores { get; set; } = new List<ScoreAI>();
    }
}
