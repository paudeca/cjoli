using cjoli.Server.Models;
using System.Text.Json.Serialization;

namespace cjoli.Server.Dtos
{
    public class MatchEventDto
    {
        public int Id { get; set; }
        public int Time { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public MatchEventType Type { get; set; }

        public int PlayerNum { get; set; }
        public int Assist1Num { get; set; }
        public int Assist2Num { get; set; }
        public int TeamId { get; set; }
        public string? Penalty { get; set; }
        public int PenaltyTime { get; set; }
        public int GoalKeeperInNum { get; set; }



    }
}
