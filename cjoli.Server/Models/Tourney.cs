using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class Tourney
    {
        public int Id { get; set; }
        [Required]
        public string Uid { get; set; }
        public string Name { get; set; }
    }
}
