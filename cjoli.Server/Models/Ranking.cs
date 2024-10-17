namespace cjoli.Server.Models
{
    public class Ranking
    {
        public required Tourney Tourney { get; set; }
        public required Scores Scores { get; set; }
    }
}
