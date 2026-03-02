using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class TourneyTeamPlayer
    {
        [Key]
        public int Id { get; set; }

        public int Number { get; set; }
        public bool IsGoalKeeper { get; set; }
        public bool IsCaptain { get; set; }
        public bool IsAssistant { get; set; }

        public PlayerTeam? Player { get; set; }
        public TeamData? Tourney { get; set; }
    }
}
