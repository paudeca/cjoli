using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class Match
    {
        [Key]
        public int Id { get; set; }
        public required Position PositionA { get; set; }
        public required Position PositionB { get; set; }
        public int ScoreA { get; set; }
        public int ScoreB { get; set; }
        public DateTime Time { get; set; }
    }
}
