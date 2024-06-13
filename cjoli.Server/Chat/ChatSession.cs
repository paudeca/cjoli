using Azure.AI.OpenAI;
using cjoli.Server.Services;

namespace cjoli.Server.Chat
{
    public class ChatSession
    {
        public List<ChatRequestMessage> Messages = new List<ChatRequestMessage>();

        public event EventHandler<ReplyMessageEvent>? OnReply;

        public void AddUserMessage(string message)
        {
            Messages.Add(new ChatRequestUserMessage(message));
        }

        public void SendReply(string reply)
        {
            OnReply?.Invoke(this, new ReplyMessageEvent { Message = reply });
        }

    }
}
