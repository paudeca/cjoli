using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class Position
    {
        [Key]
        public int Id { get; set; }
        public int Value { get; set; }
        public Team? Team { get; set; }
    }
}
