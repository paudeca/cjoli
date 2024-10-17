namespace cjoli.Server.Models
{
    public class Scores
    {
        public List<ScoreSquad> ScoreSquads { get; set; } = new List<ScoreSquad>();
        public Dictionary<int, Score> ScoreTeams { get; set; } = new Dictionary<int, Score>();
        public required Score ScoreTourney { get; set; }
    }
}
