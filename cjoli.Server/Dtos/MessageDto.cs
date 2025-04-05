using cjoli.Server.Models;

namespace cjoli.Server.Dtos
{
    public class MessageDto
    {
        public int Id { get; set; }
        public required string MessageId { get; set; }
        public required string MessageType { get; set; }
        public string? MediaUrl { get; set; }
        public string? MediaContentType { get; set; }
        public DateTime Time { get; set; }
        public bool IsPublished { get; set; }
    }
}
