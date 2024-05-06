using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class Match : IMatch
    {
        [Key]
        public int Id { get; set; }
        public bool Done { get; set; }
        public required Position PositionA { get; set; }
        public required Position PositionB { get; set; }
        public int ScoreA { get; set; }
        public int ScoreB { get; set; }
        public bool ForfeitA { get; set; }
        public bool ForfeitB { get; set; }
        public string? Location { get; set; }
        public DateTime Time { get; set; }
        public Squad? Squad { get; set; }

        public IList<MatchSimulation> Simulations { get; set; } = new List<MatchSimulation>();
        public IList<UserMatch> UserMatches { get; set; } = new List<UserMatch>();
        public IList<MatchResult> MatchResults { get; set; } = new List<MatchResult>();
    }
}
