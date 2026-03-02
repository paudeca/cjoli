using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{

    public enum MatchEventType
    {
        Start, End, Goal, Penalty, GoalKeeper
    }


    public class MatchEvent
    {
        [Key]
        public int Id { get; set; }
        public required int Time { get; set; }
        public required MatchEventType Type { get; set; }
        public required Match Match { get; set; }

        public int PlayerNum { get; set; }
        public int Assist1Num { get; set; }
        public int Assist2Num { get; set; }
        public string? Penalty { get; set; }
        public int PenaltyTime { get; set; }
        public int GoalKeeperInNum { get; set; }
        public Team? Team { get; set; }
    }
}
