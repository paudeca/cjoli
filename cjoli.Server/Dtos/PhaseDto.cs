namespace cjoli.Server.Dtos
{
    public class PhaseDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required List<SquadDto> Squads { get; set; }
    }
}
