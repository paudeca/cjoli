namespace cjoli.Server.Models.AI
{
    public class MatchAI
    {
        public int TeamIdA { get; set; }
        public int TeamIdB { get; set; }
        public string? TeamA { get; set; }
        public string? TeamB { get; set; }
        public int ScoreA { get; set; }
        public int ScoreB { get; set; }
        public string? Location { get; set; }
        public DateTime Time { get; set; }
    }
}
