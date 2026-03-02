using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class Player
    {
        [Key]
        public int Id { get; set; }
        public required string LastName { get; set; }
        public required string FirstName { get; set; }

        public DateOnly? Birthday { get; set; }

        public IList<PlayerTeam> Teams { get; set; } = new List<PlayerTeam>();

    }
}
