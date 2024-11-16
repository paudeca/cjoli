using Azure.AI.OpenAI;

namespace cjoli.Server.Chat
{
    public class ChatSession
    {
        public List<ChatRequestMessage> Messages = [];
        public List<ChatMessage> ChatMessages = [];

        public event EventHandler<ReplyMessageEvent>? OnReply;

        public void AddUserMessage(string message)
        {
            Messages.Add(new ChatRequestUserMessage(message));
            ChatMessages.Add(new() { Type = "user", Message = message, Time = DateTime.Now });
        }

        public void AddSystemMessage(string message)
        {
            Messages.Add(new ChatRequestSystemMessage(message));
        }

        public void AddAssistantMessage(string message)
        {
            Messages.Add(new ChatRequestAssistantMessage(message));
            ChatMessages.Add(new() { Type="assistant",Message=message, Time=DateTime.Now});
        }

        public void SendReply(string reply)
        {
            OnReply?.Invoke(this, new ReplyMessageEvent { Message = reply });
        }

    }
}
