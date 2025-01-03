using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace cjoli.Server.Models
{
    public class UserMatch : IMatch
    {
        [Key]
        public int Id { get; set; }
        public required Match Match { get; set; }
        public required User User { get; set; }
        public int ScoreA { get; set; }
        public int ScoreB { get; set; }
        public bool ForfeitA { get; set; }
        public bool ForfeitB { get; set; }
        public DateTime LogTime { get; set; }
        [NotMapped]
        public int BetScore { get; set; }

        public DateTime Time { get { return Match.Time; } }
    }
}
