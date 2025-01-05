using cjoli.Server.Dtos;

namespace cjoli.Server.Models
{
    public class Ranking
    {
        public required Tourney Tourney { get; set; }
        public required ScoresDto Scores { get; set; }
    }
}
