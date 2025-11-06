using cjoli.Server.Models;
using System.Text.Json.Serialization;

namespace cjoli.Server.Dtos
{
    public class MatchDto : IMatch, IPenalty
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public bool Done { get; set; }
        public int TeamIdA { get; set; }
        public int TeamIdB { get; set; }
        public int PositionA { get; set; }
        public int PositionIdA { get; set; }
        public int PositionB { get; set; }
        public int PositionIdB { get; set; }
        public int ScoreA { get; set; }
        public int ScoreB { get; set; }
        public bool ForfeitA { get; set; }
        public bool ForfeitB { get; set; }
        public bool Shot { get; set; }
        public string? Location { get; set; }
        public DateTime Time { get; set; }
        public int SquadId { get; set; }
        public int PhaseId { get; set; }
        public UserMatchDto? UserMatch { get; set; }
        public List<PhaseDto> Phases { get; set; } = new List<PhaseDto>();
        public MatchEstimateDto? Estimate { get; set; }
        public int PenaltyA { get; set; }
        public int PenaltyB { get; set; }
        public string? Tournify { get; set; }
        public bool WinnerA { get; set; }
        public bool WinnerB { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public Models.MatchType MatchType { get; set; }
        public int MatchOrder { get; set; }


    }
}
