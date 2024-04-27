using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public required string Login { get; set; }
        [Required]
        public required string Password { get; set; }

        public IList<Tourney> Tourneys { get; set; } = new List<Tourney>();
    }
}
