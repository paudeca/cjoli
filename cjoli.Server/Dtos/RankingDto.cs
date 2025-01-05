using cjoli.Server.Models;

namespace cjoli.Server.Dtos
{
    public class RankingDto
    {
        public required TourneyDto Tourney { get; set; }
        public required ScoresDto Scores { get; set; }
        public Dictionary<int, List<Score>> History { get; set; } = new Dictionary<int, List<Score>>();
    }
}
