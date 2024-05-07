using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class MatchEstimate
    {
        [Key]
        public int Id { get; set; }

        public required Match Match { get; set; }
        public int ScoreA { get; set; }
        public int ScoreB { get; set; }
        public User? User { get; set; }
    }
}
