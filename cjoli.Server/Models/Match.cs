using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class Match
    {
        [Key]
        public int Id { get; set; }
        public required Team TeamA { get; set; }
        public required Team TeamB { get; set; }
        public int ScoreA { get; set; }
        public int ScoreB { get; set; }
        public DateTime Time { get; set; }
    }
}
