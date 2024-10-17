using cjoli.Server.Models;
using cjoli.Server.Services;
using Microsoft.AspNetCore.Mvc;
using System.Net.WebSockets;
using System.Text;

namespace cjoli.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly AIService _service;
        private readonly CJoliContext _context;

        public ChatController(AIService service, CJoliContext context)
        {
            _service = service;
            _context = context;
        }

        [HttpGet]
        [Route("{uuid}/ws")]
        public async Task Get(string uuid, [FromQuery] string lang)
        {
            if (HttpContext.WebSockets.IsWebSocketRequest)
            {
                using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                await Bot(webSocket, uuid, lang);
            }
            else
            {
                HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            }
        }

        private async Task Bot(WebSocket webSocket, string uuid, string lang)
        {
            var session = _service.CreateSession(uuid, lang, _context);
            session.OnReply += async (sender, e) => { await SendMessage(e.Message, webSocket); };
            await _service.PromptMessage(session);

            //await SendMessage(welcome, webSocket);

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
