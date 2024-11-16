namespace cjoli.Server.Chat
{
    public class ChatMessage
    {
        public DateTime Time { get; set; }
        public required string Type { get; set; }
        public required string Message { get; set; }
    }
}
