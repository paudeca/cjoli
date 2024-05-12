using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class Tourney
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public required string Uid { get; set; }
        public required string Name { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? Season { get; set; }
        public string? Category { get; set; }
        public string? Rule { get; set; }

        public IList<Team> Teams { get; set; } = new List<Team>();
        public IList<Phase> Phases { get; set; } = new List<Phase>();
        public IList<Rank> Ranks { get; set; } = new List<Rank>();
        public IList<TeamData> TeamDatas { get; set; } = new List<TeamData>();
    }
}
