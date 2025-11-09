
using System.Text.Json.Serialization;

namespace cjoli.Server.Dtos
{
    public class PositionDto
    {
        public int Id { get; set; }
        public int Value { get; set; }
        public string? Name { get; set; }
        public string? Short { get; set; }
        public int Penalty { get; set; }
        public int TeamId { get; set; }
        public int SquadId { get; set; }
        public ParentPositionDto? ParentPosition { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public Models.MatchType MatchType { get; set; }
        public int MatchOrder { get; set; }
        public bool Winner { get; set; }

    }

}