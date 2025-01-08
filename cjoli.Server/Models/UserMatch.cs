using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace cjoli.Server.Models
{
    public class UserMatch : IMatch
    {
        [Key]
        public int Id { get; set; }
        public required Match Match { get; set; }
        public User? User { get; set; }
        public int ScoreA { get; set; }
        public int ScoreB { get; set; }
        public bool ForfeitA { get; set; }
        public bool ForfeitB { get; set; }
        public DateTime LogTime { get; set; }
        public int BetScore { get; set; }
        public bool BetPerfect { get; set; }
        public bool BetWinner { get; set; }
        public bool BetDiff { get; set; }
        public bool BetGoal { get; set; }

        public DateTime Time { get { return Match.Time; } }
    }
}
