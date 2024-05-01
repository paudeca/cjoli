namespace cjoli.Server.Dtos
{
    public class ParentPositionDto
    {
        public required string Phase { get; set; }
        public int SquadId { get; set; }
        public required string Squad { get; set; }
        public int Value { get; set; }
    }
}
