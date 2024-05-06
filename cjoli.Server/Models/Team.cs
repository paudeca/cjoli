using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class Team
    {
        [Key]
        public int Id { get; set; }
        public required string Name { get; set; }
        public IList<Tourney> Tourneys { get; set; } = new List<Tourney>();
        public IList<Position> Positions { get; set; } = new List<Position>();
        public string? Logo { get; set; }
        public DateOnly? Youngest { get; set; }

        public IList<MatchResult> MatchResults { get; set; } = new List<MatchResult>();
    }
}
