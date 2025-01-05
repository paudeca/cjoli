namespace cjoli.Server.Dtos
{
    public class BetDto
    {
        public List<BetScoreDto> Scores { get; set; } = new List<BetScoreDto>();
        public Dictionary<int, List<BetScoreDto>> History { get; set; } = new Dictionary<int, List<BetScoreDto>>();
        public List<UserDto> Users { get; set; } = new List<UserDto>();

    }
}
