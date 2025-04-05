using cjoli.Server.Models;
using System.Text.Json.Serialization;

namespace cjoli.Server.Dtos
{
    public class EventDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public DateTime Time { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public required EventType EventType { get; set; }
        public string? Datas { get; set; }

        public List<int> PositionIds { get; set; } = new List<int>();
        public List<int> SquadIds { get; set; } = new List<int>();

    }
}
