using cjoli.Server.Models;
using cjoli.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Serilog.Context;
using System.Net.WebSockets;
using System.Text;
using cjoli.Server.Extensions;

namespace cjoli.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly AIService _service;
        private readonly CJoliService _cjoliService;
        private readonly CJoliContext _context;
        private readonly ILogger _logger;

        public ChatController(AIService service, CJoliService cjoliService, CJoliContext context, ILogger<ChatController> logger)
        {
            _service = service;
            _cjoliService = cjoliService;
            _context = context;
            _logger = logger;
        }


        [HttpGet]
        [Route("{uuid}/ws")]
        public async Task Get(string uuid, [FromQuery] string lang, [FromQuery] string? login, CancellationToken ct)
        {
            try
            {
                _logger.LogInformation($"Start a new session chat with uuid:{uuid}, lang:{lang} login:{login}");
                using (LogContext.PushProperty("uid", uuid))
                {
                    if (HttpContext.WebSockets.IsWebSocketRequest)
                    {
                        using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                        _logger.LogDebug("webSocket created");
                        await Bot(webSocket, uuid, lang, login, ct);
                    }
                    else
                    {
                        HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                    }
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unable to start chat");
                throw;
            }
        }

        private async Task Bot(WebSocket webSocket, string uuid, string lang, string login, CancellationToken ct)
        {
            var dto = await _cjoliService.CreateRanking(uuid, login, false, _context, ct);
            var session = _service.CreateSessionForChat(uuid, lang, login, dto, _context);
            session.OnReply += async (sender, e) =>
            {
                if (webSocket.State == WebSocketState.Open)
                {
                    await SendMessage(e.Message, webSocket);
                }
            };
            await _service.PromptMessage(session);

            try
            {
                var buffer = new byte[1024 * 4];
                var receiveResult = await webSocket.ReceiveAsync(
                    new ArraySegment<byte>(buffer), CancellationToken.None);

                while (!receiveResult.CloseStatus.HasValue)
                {
                    string message = Encoding.UTF8.GetString(buffer, 0, receiveResult.Count);
                    session.AddUserMessage(message);

                    await _service.PromptMessage(session);

                    receiveResult = await webSocket.ReceiveAsync(
                        new ArraySegment<byte>(buffer), CancellationToken.None);
                }

                _logger.LogInformationWithData("chat done", session.ChatMessages);

                if (webSocket.State == WebSocketState.Open)
                {
                    await webSocket.CloseAsync(
                        receiveResult.CloseStatus.Value,
                        receiveResult.CloseStatusDescription,
                        CancellationToken.None);
                }
            }
            catch (WebSocketException ex) when (ex.WebSocketErrorCode == WebSocketError.ConnectionClosedPrematurely || ex.WebSocketErrorCode == WebSocketError.InvalidState)
            {
                _logger.LogWarning($"WebSocket connection closed prematurely. Uuid: {uuid}, Login: {login}. Error: {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occurred in the Bot WebSocket loop. Uuid: {uuid}, Login: {login}.");
            }
        }

        private async Task SendMessage(string message, WebSocket webSocket)
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
