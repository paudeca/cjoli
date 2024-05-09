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
    }
}
