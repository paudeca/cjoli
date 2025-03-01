namespace cjoli.Server.Dtos
{
    public class PhaseDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public List<SquadDto> Squads { get; set; } = new List<SquadDto>();
        public List<EventDto> Events { get; set; } = new List<EventDto>();
    }
}
