using cjoli.Server.Server;
using Microsoft.ApplicationInsights;
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
        private readonly ConcurrentDictionary<string, SessionSocket> _clients = new ConcurrentDictionary<string, SessionSocket>();
        private readonly ILogger<ServerService> _logger;
        private readonly TelemetryClient _telemetryClient;

        public ServerService(ILogger<ServerService> logger, TelemetryClient telemetryClient)
        {
            _logger = logger;
            _telemetryClient = telemetryClient;
        }

        public void Read(string socketId, ServerMessage message)
        {
            switch (message.Type)
            {
                case ServerMessageType.selectTourney:
                    {
                        var m = message as SelectTourneyMessage;
                        var session = _clients.Single(s => s.Key == socketId).Value;
                        session.TourneyUid = m!.Uid;
                        _logger.LogInformation("users connected to {@uid} count:{@count}", m!.Uid, _clients.Where(c => c.Value.TourneyUid == m!.Uid).Count());
                        break;
                    }
            }
        }

        public int CountUser => _clients.Count;
        public Dictionary<string, int> GetUsersByTourney => _clients.GroupBy(c => c.Value.TourneyUid).ToDictionary(kv => kv.Key ?? "default", kv => kv.Count());

        public string AddClient(WebSocket ws)
        {
            string socketId = Guid.NewGuid().ToString();
            _clients.TryAdd(socketId, new SessionSocket() { WebSocket = ws, TourneyUid = "default" });
            _logger.LogInformation("new user connected count:{@count}", _clients.Count);
            return socketId;
        }

        public void RemoveClient(string socketId, WebSocket ws)
        {
            SessionSocket? session = null;
            _clients.TryRemove(socketId, out session);
            _logger.LogInformation("user leaves count:{@count}", _clients.Count);
        }

        public async Task SendUsers()
        {
            var message = new UsersMessage(_clients.Count);
            await Broadcast(JsonSerializer.Serialize(message));
        }

        public void UpdateRanking(string uid)
        {
            var message = new UpdateRankingMessage();
            _ = Broadcast(JsonSerializer.Serialize(message), _clients.Where(s => s.Value.TourneyUid == uid).Select(s => s.Value).ToList());
        }

        public void Estimation(string uid, bool started)
        {
            var message = new EstimationMessage(started);
            _ = Broadcast(JsonSerializer.Serialize(message), _clients.Where(s => s.Value.TourneyUid == uid).Select(s => s.Value).ToList());
        }

        private async Task Broadcast(string message, List<SessionSocket>? sockets = null)
        {
            byte[] buffer = Encoding.UTF8.GetBytes(message);
            if (sockets == null)
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
