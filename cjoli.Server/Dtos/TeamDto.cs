namespace cjoli.Server.Dtos
{
    public class TeamDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Logo { get; set; }
        public DateOnly? Youngest { get; set; }
    }
}
