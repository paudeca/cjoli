namespace cjoli.Server.Models.Twilio
{
    public class MessageTwilio
    {
        public required string MessageSid { get; set; }
        public required string From { get; set; }
        public required string To { get; set; }
        public required string MessageType { get; set; }
        public string? Body { get; set; }
        public string? MediaUrl0 { get; set; }
        public string? MediaContentType0 { get; set; }
    }
}
