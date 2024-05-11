namespace cjoli.Server.Dtos
{
    public class TourneyDto
    {
        public int Id { get; set; }
        public string? Uid { get; set; }
        public string? Name { get; set; }
        public string? Season { get; set; }
        public string? Category { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }


        public List<PhaseDto>? Phases { get; set; }
        public List<TeamDto>? Teams { get; set; }
        public List<RankDto>? Ranks { get; set; }


    }
}
