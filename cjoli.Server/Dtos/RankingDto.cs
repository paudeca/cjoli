using cjoli.Server.Models;

namespace cjoli.Server.Dtos
{
    public class RankingDto
    {
        public TourneyDto? Tourney { get; set; }
        public ScoresDto? Scores { get; set; }
        public TeamDto? Team { get; set; }
        public Dictionary<int, List<Score>> History { get; set; } = new Dictionary<int, List<Score>>();
    }
}
