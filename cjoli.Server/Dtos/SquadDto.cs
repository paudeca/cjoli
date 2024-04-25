namespace cjoli.Server.Dtos
{
    public class SquadDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required List<PositionDto> Positions { get; set; }
        public required List<MatchDto> Matches { get; set; }

    }
}
