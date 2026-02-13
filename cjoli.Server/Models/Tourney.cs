using cjoli.Server.Services.Rules;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace cjoli.Server.Models
{
    public class Tourney
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public required string Uid { get; set; }
        public required string Name { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public DateTime? DisplayTime { get; set; }
        public string? Season { get; set; }
        public string? Category { get; set; }
        public string? Rule { get; set; }
        public string? WhatsappNumber { get; set; }
        public string? WhatsappNotif { get; set; }
        public string? Tournify { get; set; }
        public bool HasTournifySynchroName { get; set; }
        public string? RuleConfig { get; set; }
        public string? WebhookConfig { get; set; }

        [NotMapped]
        public IRule? Config { get; set; }

        public IList<Team> Teams { get; set; } = new List<Team>();
        public List<Phase> Phases { get; set; } = new List<Phase>();
        public IList<Rank> Ranks { get; set; } = new List<Rank>();
        public IList<TeamData> TeamDatas { get; set; } = new List<TeamData>();
        public IList<Message> Messages { get; set; } = new List<Message>();

    }

    public class TourneyWebhook
    {
        [JsonPropertyName("url")]
        public string? Url { get; set; }
    }
}
