namespace cjoli.Server.Dtos
{
    public class BetScoreDto
    {
        public required UserDto User { get; set; }
        public int Score { get; set; }
        public int Perfect { get; set; }
        public int Winner { get; set; }
        public int Diff { get; set; }
        public int Goal { get; set; }
    }
}
