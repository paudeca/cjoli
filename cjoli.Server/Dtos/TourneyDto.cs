namespace cjoli.Server.Dtos
{
    public class TourneyDto
    {
        public int Id { get; set; }
        public required string Uid { get; set; }
        public required string Name { get; set; }
        //public required List<TeamDto> Teams { get; set; }
        //public required List<MatchDto> Matches { get; set; }
    }
}
