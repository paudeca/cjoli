namespace cjoli.Server.Dtos
{
    public class SquadDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public List<PositionDto>? Positions { get; set; }
        public List<MatchDto>? Matches { get; set; }
        public List<int>? TeamId { get; set; }

    }
}
