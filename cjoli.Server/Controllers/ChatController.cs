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
        private readonly CJoliContext _context;
        private readonly ILogger _logger;

        public ChatController(AIService service, CJoliContext context, ILogger<ChatController> logger)
        {
            _service = service;
            _context = context;
            _logger = logger;
        }


        [HttpGet]
        [Route("{uuid}/ws")]
        public async Task Get(string uuid, [FromQuery] string lang, [FromQuery] string login)
        {
            using(LogContext.PushProperty("uid",uuid))
            {
                if (HttpContext.WebSockets.IsWebSocketRequest)
                {
                    using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                    await Bot(webSocket, uuid, lang, login);
                }
                else
                {
                    HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                }
            }
        }

        private async Task Bot(WebSocket webSocket, string uuid, string lang, string login)
        {
            var session = _service.CreateSessionForChat(uuid, lang, login, _context);
            session.OnReply += async (sender, e) => { await SendMessage(e.Message, webSocket); };
            await _service.PromptMessage(session);

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


            await webSocket.CloseAsync(
                receiveResult.CloseStatus.Value,
                receiveResult.CloseStatusDescription,
                CancellationToken.None);
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
