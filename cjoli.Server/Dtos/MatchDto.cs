namespace cjoli.Server.Dtos
{
    public class MatchDto
    {
        public int Id { get; set; }
        public bool Done { get; set; }
        public int PositionA { get; set; }
        public int PositionIdA { get; set; }
        public int PositionB { get; set; }
        public int PositionIdB { get; set; }
        public int ScoreA { get; set; }
        public int ScoreB { get; set; }
        public bool ForfeitA { get; set; }
        public bool ForfeitB { get; set; }
        public bool Shot { get; set; }
        public string? Location { get; set; }
        public DateTime Time { get; set; }
        public int SquadId { get; set; }
        public int PhaseId { get; set; }
        public UserMatchDto? UserMatch { get; set; }
        public MatchEstimateDto? Estimate { get; set; }
    }
}
