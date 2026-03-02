using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class PlayerTeam
    {
        [Key]
        public int Id { get; set; }
        public required Player Player { get; set; }
        public required Team Team { get; set; }
        public required DateOnly BeginDate { get; set; }
        public DateOnly? EndDate { get; set; }

        public IList<TourneyTeamPlayer> Tourneys { get; set; } = new List<TourneyTeamPlayer>();
    }
}
