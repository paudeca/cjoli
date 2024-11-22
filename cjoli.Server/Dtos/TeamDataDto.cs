namespace cjoli.Server.Dtos
{
    public class TeamDataDto
    {
        public int Id { get; set; }
        public int Penalty { get; set; }

        public string? Name { get; set; }
        public string? Logo { get; set; }
        public string? PrimaryColor { get; set; }
        public string? SecondaryColor { get; set; }
    }
}
