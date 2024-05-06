using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class UserConfig
    {
        [Key]
        public int Id { get; set; }
        public required User User { get; set; }
        public required Tourney Tourney { get; set; }
        public bool ActiveSimulation { get; set; }
        public bool UseCustomSimulation { get; set; }
    }
}
