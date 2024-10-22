using cjoli.Server.Server;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace cjoli.Server.Services
{

    public class SessionSocket
    {
        public WebSocket? WebSocket { get; set; }
        public string? TourneyUid { get; set; }
    }

    public class ServerService
    {
        private readonly ConcurrentDictionary<string, SessionSocket> _clients= new ConcurrentDictionary<string, SessionSocket>();


        public ServerService() { }

        public void Read(string socketId, ServerMessage message)
        {
            switch(message.Type)
            {
                case ServerMessageType.selectTourney:
                    {
                        var m = message as SelectTourneyMessage;
                        _clients.First(s => s.Key == socketId).Value.TourneyUid = m!.Uid;
                        break;
                    }
            }
        }

        public string AddClient(WebSocket ws)
        {
            string socketId = Guid.NewGuid().ToString();
            _clients.TryAdd(socketId, new SessionSocket() { WebSocket = ws });
            return socketId;
        }

        public void RemoveClient(string socketId, WebSocket ws)
        {
            SessionSocket session = null;
            _clients.TryRemove(socketId, out session);
        }

        public async Task SendUsers()
        {
            var message = new UsersMessage(_clients.Count);
            await Broadcast(JsonSerializer.Serialize(message));
        }

        public void UpdateRanking(string uid)
        {
            var message = new UpdateRankingMessage();
            _ = Broadcast(JsonSerializer.Serialize(message),_clients.Where(s=>s.Value.TourneyUid==uid).Select(s=>s.Value).ToList());
        }

        private async Task Broadcast(string message, List<SessionSocket> sockets=null)
        {
            byte[] buffer = Encoding.UTF8.GetBytes(message);
            if(sockets==null)
            {
                sockets = _clients.Values.ToList();
            }
            foreach (var session in sockets)
            {
                var webSocket = session.WebSocket;
                if (webSocket!.State == WebSocketState.Open)
                {
                    await webSocket.SendAsync(
                        new ArraySegment<byte>(buffer, 0, buffer.Length),
                        WebSocketMessageType.Text,
                        true,
                        CancellationToken.None);
                }
            }
        }


    }
}
