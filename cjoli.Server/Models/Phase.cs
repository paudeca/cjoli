using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class Phase
    {
        [Key]
        public int Id { get; set; }
        public required string Name { get; set; }
        public IList<Squad> Squads { get; set; } = new List<Squad>();
        public DateTime Time { get; set; }
        public required Tourney Tourney { get; set; }
    }
}
