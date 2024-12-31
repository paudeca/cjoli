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
        public string? Role { get; set; }
        public required string Source { get; set; }

        public IList<UserConfig> Configs { get; set; } = new List<UserConfig>();
        public IList<UserMatch> UserMatches { get; set; } = new List<UserMatch>();

    }
}
