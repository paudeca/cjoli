namespace cjoli.Server.Dtos
{
    public class MatchDto
    {
        public int Id { get; set; }
        public int PositionA { get; set; }
        public int PositionB { get; set; }
        //public required PositionDto PositionA { get; set; }
        //public required PositionDto PositionB { get; set; }
        public int ScoreA { get; set; }
        public int ScoreB { get; set; }
    }
}
