using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class Position
    {
        [Key]
        public int Id { get; set; }
        public int Value { get; set; }
        public string? Name { get; set; }
        public string? Short { get; set; }
        public int Penalty { get; set; }
        public Team? Team { get; set; }
        public Squad? Squad { get; set; }
        public ParentPosition? ParentPosition { get; set; }
        public IList<Event> Events { get; set; } = new List<Event>();
        public string? Tournify { get; set; }
        public string? TournifyPoule { get; set; }
        public MatchType? MatchType { get; set; }
        public int MatchOrder { get; set; }
        public bool Winner { get; set; }
    }
}
