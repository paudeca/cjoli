namespace cjoli.Server.Dtos
{
    public class MatchDto
    {
        public int Id { get; set; }
        public bool Done { get; set; }
        public int PositionA { get; set; }
        public int PositionB { get; set; }
        public int ScoreA { get; set; }
        public int ScoreB { get; set; }
        public bool ForfeitA { get; set; }
        public bool ForfeitB { get; set; }
    }
}
