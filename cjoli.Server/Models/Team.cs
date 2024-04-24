using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class Team
    {
        [Key]
        public int Id { get; set; }
        public required string Name { get; set; }
    }
}
