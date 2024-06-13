namespace cjoli.Server.Dtos
{
    public class RankDto
    {
        public int Id { get; set; }
        public int Order { get; set; }
        public int Value { get; set; }
        public int PhaseId { get; set; }
        public int SquadId { get; set; }
        public required string Phase { get; set; }
        public required string Squad { get; set; }
        public string? Name { get; set; }
        public int TeamId { get; set; }
    }
}
