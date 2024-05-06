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

        public IList<Team> Teams { get; set; } = new List<Team>();
        public IList<Phase> Phases { get; set; } = new List<Phase>();
    }
}
