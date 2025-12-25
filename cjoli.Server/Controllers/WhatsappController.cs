using cjoli.Server.Models;
using cjoli.Server.Models.Twilio;
using cjoli.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace cjoli.Server.Controllers
{

    public class Request
    {
        public required string MessageSid { get; set; }
        public required string To { get; set; }
        public required string From { get; set; }
        public string? Body { get; set; }
        public string? MediaUrl0 { get; set; }
        public string? MediaContentType0 { get; set; }
    }

    [ApiController]
    [Route("[controller]")]
    public class WhatsappController : ControllerBase
    {
        private readonly MessageService _messageService;
        private readonly CJoliContext _context;

        public WhatsappController(MessageService messageService, CJoliContext context)
        {
            _messageService = messageService;
            _context = context;
        }
        [HttpPost]
        [Route("{uid}/Inbound")]
        public async Task Inbound([FromRoute] string uid, [FromForm] MessageTwilio message, CancellationToken ct)
        {
            await _messageService.InboundMessage(uid, message, _context, ct);
        }

    }

}
