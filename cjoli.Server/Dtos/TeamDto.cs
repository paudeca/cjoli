namespace cjoli.Server.Dtos
{
    public class TeamDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Logo { get; set; }
        public DateOnly? Youngest { get; set; }
        public string? ShortName { get; set; }
        public string? Alias { get; set; }
        public TeamDataDto? Datas { get; set; }
        public string? FullName { get; set; }

    }
}
