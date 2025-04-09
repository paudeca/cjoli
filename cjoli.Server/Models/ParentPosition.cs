using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class ParentPosition
    {
        [Key]
        public int Id { get; set; }
        public Phase? Phase { get; set; }
        public Squad? Squad { get; set; }
        public int Value { get; set; }
        public int PositionId { get; set; }
        public required Position Position { get; set; }
    }
}
