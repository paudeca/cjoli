namespace cjoli.Server.Dtos
{
    public class TourneyDto
    {
        public int Id { get; set; }
        public required string Uid { get; set; }
        public required string Name { get; set; }
        public required List<PhaseDto> Phases { get; set; }
        public required List<TeamDto> Teams { get; set; }

    }
}
