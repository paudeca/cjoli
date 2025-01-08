using System.Text.Json.Serialization;

namespace cjoli.Server.Models
{

    public enum SourceType
    {
        total,
        win,
        loss,
        direct,
        goalDiff,
        goalDiffDirect,
        goalFor,
        goalForDirect,
        goalAgainst,
        goalAgainstDirect,
        youngest,
        equal
    }

    public class ScoreSource
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public SourceType Type { get; set; }
        public int Value { get; set; }
        public bool Winner { get; set; }
    }
}
