using cjoli.Server.Models;
using cjoli.Server.Server;
using cjoli.Server.Services;
using Microsoft.AspNetCore.Mvc;
using System.Net.WebSockets;
using System.Text;

namespace cjoli.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ServerController : ControllerBase
    {
        private readonly ServerService _service;
        private readonly AIService _aiService;
        private readonly CJoliContext _context;
        private readonly ILogger<ServerController> _logger;

        public ServerController(ServerService service, AIService aiService, CJoliContext context, ILogger<ServerController> logger)
        {
            _service = service;
            _aiService = aiService;
            _context = context;
            _logger = logger;
        }


        [HttpGet]
        [Route("ws")]
        public async Task Get()
        {
            if (HttpContext.WebSockets.IsWebSocketRequest)
            {
                using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                string socketId = _service.AddClient(webSocket);
                try
                {
                    await Run(socketId, webSocket);
                }
                finally
                {
                    _service.RemoveClient(socketId, webSocket);
                    await _service.SendUsers();
                }
            }
            else
            {
                HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            }
        }

        private async Task Run(string socketId, WebSocket webSocket)
        {
            try
            {
                await _service.SendUsers();
                var buffer = new byte[1024 * 4];
                var receiveResult = await webSocket.ReceiveAsync(
                    new ArraySegment<byte>(buffer), CancellationToken.None);

                while (webSocket.State == WebSocketState.Open && !receiveResult.CloseStatus.HasValue)
                {
                    string message = Encoding.UTF8.GetString(buffer, 0, receiveResult.Count);
                    var m = ServerMessage.Parse(message);
                    _service.Read(socketId, m);


                    receiveResult = await webSocket.ReceiveAsync(
                        new ArraySegment<byte>(buffer), CancellationToken.None);
                }

                if (receiveResult.CloseStatus.HasValue && webSocket.State == WebSocketState.Open)
                {
                    await webSocket.CloseAsync(
                        receiveResult.CloseStatus.Value,
                        receiveResult.CloseStatusDescription,
                        CancellationToken.None);
                }
            }
            catch (WebSocketException ex) when (ex.WebSocketErrorCode == WebSocketError.ConnectionClosedPrematurely || ex.WebSocketErrorCode == WebSocketError.InvalidState)
            {
                _logger.LogWarning($"WebSocket connection closed prematurely. SocketId: {socketId}. Error: {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occurred in the Run WebSocket loop. SocketId: {socketId}.");
            }
        }

        private async Task SendMessage(string message, WebSocket webSocket)
        {
            if (webSocket.State == WebSocketState.Open)
            {
                byte[] buffer = Encoding.UTF8.GetBytes(message);
                await webSocket.SendAsync(
                    new ArraySegment<byte>(buffer, 0, buffer.Length),
                    WebSocketMessageType.Text,
                    true,
                    CancellationToken.None);
            }
        }

    }

}
