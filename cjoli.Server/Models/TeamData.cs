namespace cjoli.Server.Models
{
    public class TeamData
    {
        public int Id { get; set; }
        public required Team Team { get; set; }
        public required Tourney Tourney { get; set; }
        public int Penalty { get; set; }

        public string? Name { get; set; }
        public string? Logo { get; set; }
        public string? PrimaryColor { get; set; }
        public string? SecondaryColor { get; set; }

        public string? Tournify { get; set; }

    }
}
