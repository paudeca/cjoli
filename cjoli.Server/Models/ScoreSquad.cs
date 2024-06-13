namespace cjoli.Server.Models
{
    public class ScoreSquad
    {
        public int SquadId { get; set; }
        public List<Score> Scores { get; set; } = new List<Score>();
        public Dictionary<int, Score>? TeamScores { get; set; }

    }
}
