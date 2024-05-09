using cjoli.Server.Services;

namespace cjoli.Server.Dtos
{
    public class RankingDto
    {
        public required TourneyDto Tourney { get; set; }
        public required Scores Scores { get; set; }
    }
}
