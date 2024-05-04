using System.ComponentModel.DataAnnotations;

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
    }
}
