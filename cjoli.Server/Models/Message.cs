using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class Message
    {
        [Key]
        public int Id { get; set; }
        public required string MessageId { get; set; }
        public required string From { get; set; }
        public required string To { get; set; }
        public required string MessageType { get; set; }
        public string? Body { get; set; }
        public string? MediaUrl { get; set; }
        public string? MediaContentType { get; set; }
        public string? MediaName { get; set; }
        public DateTime Time { get; set; }
        public required Tourney Tourney { get; set; }
        public bool IsPublished { get; set; }
        public required string Destination { get; set; }
    }
}
