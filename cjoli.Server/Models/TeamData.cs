namespace cjoli.Server.Models
{
    public class TeamData
    {
        public int Id { get; set; }
        public required Team Team { get; set; }
        public required Tourney Tourney { get; set; }
        public int Penalty { get; set; }
    }
}
