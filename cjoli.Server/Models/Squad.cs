using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class Squad
    {
        [Key]
        public int Id { get; set; }
        public required string Name { get; set; }
        public IList<Position> Positions { get; set; } = new List<Position>();
        public IList<Match> Matches { get; set; } = new List<Match>();
    }
}
