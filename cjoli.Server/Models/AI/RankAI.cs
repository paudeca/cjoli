namespace cjoli.Server.Models.AI
{
    public class RankAI
    {
        public int Order { get; set; }
        public required string Name { get; set; }
        public int TeamId { get; set; }
        public string? Team { get; set; }
    }
}
