using cjoli.Server.Exceptions;
using cjoli.Server.Models;
using cjoli.Server.Models.AI;
using cjoli.Server.Models.Twilio;
using Microsoft.EntityFrameworkCore;
using System;
using System.Text.Json;
using Twilio.Rest.Api.V2010.Account;

namespace cjoli.Server.Services
{
    public class MessageService
    {
        private readonly TwilioService _twilioService;
        private readonly StorageService _storageService;
        private readonly CJoliService _cjoliService;
        private readonly AIService _aiService;
        private readonly ILogger<MessageService> _logger;
        private readonly IConfiguration _configuration;

        public MessageService(
            TwilioService twilioService,
            StorageService storageService,
            CJoliService cjoliService,
            AIService aIService,
            ILogger<MessageService> logger,
            IConfiguration configuration) {
            _twilioService = twilioService;
            _storageService = storageService;
            _cjoliService = cjoliService;
            _aiService = aIService;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task InboundMessage(string uuid, MessageTwilio message, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys.SingleOrDefault(t => t.Uid == uuid);
            if (tourney == null)
            {
                throw new NotFoundException("Tourney", uuid);
            }

            Message m = CreateMessage(tourney, message, context);
            string? answer = null;
            if(m.MessageType == "image" && m.MediaUrl!=null && m.MediaContentType!=null)
            {
                var stream = await _twilioService.LoadMedia(m.MediaUrl);
                string name = $"{DateTime.Now.ToString("yyyy-MM-dd")}/{m.MessageId}";                
                string url = await _storageService.SaveBlob(stream, uuid, name, m.MediaContentType);
                m.MediaUrl = url;
                m.MediaName = name;
                answer = await GenerateAnswer(uuid, tourney, message.From,"L'utilisateur a envoyé une image", false, context);


                if(!string.IsNullOrEmpty(tourney.WhatsappNotif))
                {
                    try
                    {
                        string variables = JsonSerializer.Serialize(new Dictionary<string, string> { { "1", message.From } });
                        string contentSid = _configuration["TwilioNotifContentSid"]!;
                        foreach (string notif in tourney.WhatsappNotif.Split(';'))
                        {
                            await _twilioService.SendMessageTemplate(contentSid: contentSid, contentVariables: variables, from: message.To, to: $"whatsapp:{notif}");
                        }
                    }
                    catch (Exception e)
                    {
                        _logger.LogError(e,"Unable to send notif");
                    }
                }
            }
            else if(message.Body!=null)
            {
                answer = await GenerateAnswer(uuid, tourney, message.From, message.Body, true, context);
            }

            if (answer!=null)
            {
                Message rep = await _twilioService.SendMessage(body: answer, from: message.To, to: message.From, tourney: tourney);
                tourney.Messages.Add(rep);
            }

            context.SaveChanges();
        }

        private async Task<string?> GenerateAnswer(string uuid, Tourney tourney, String from, String body,bool isUser, CJoliContext context)
        {
            var dto = _cjoliService.CreateRanking(uuid, null, context);
            var session = _aiService.CreateSessionForChat(uuid, null, null, dto, context);

            List<Message> messages = context.Messages
                .Where(m => m.Tourney == tourney && (m.From == from || m.To == from) && m.Body!=null && m.Time>DateTime.Now.AddMinutes(-60))
                .OrderBy(m => m.Time).ToList();
            messages.ForEach(m =>
            {
                if (m.Body != null)
                {
                    if (m.Destination == "inbound")
                    {
                        session.AddUserMessage(m.Body);
                    }
                    else
                    {
                        session.AddAssistantMessage(m.Body);
                    }
                }
            });
            if(isUser)
            {
                session.AddUserMessage(body);
            } else
            {
                session.AddSystemMessage(body);
            }
            string? answer = await _aiService.PromptMessage(session);
            return answer;

        }

        private Message CreateMessage(Tourney tourney, MessageTwilio message, CJoliContext context)
        {
            Message m = new Message()
            {
                MessageId = message.MessageSid,
                From = message.From,
                To = message.To,
                Body = message.Body,
                MessageType = message.MessageType,
                MediaUrl = message.MediaUrl0,
                MediaContentType = message.MediaContentType0,
                Time = DateTime.Now,
                Tourney = tourney,
                IsPublished = false,
                Destination = "inbound"
            };
            tourney.Messages.Add(m);
            return m;
        }

        public async Task UploadImage(Stream stream, string contentType, string uuid, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys.SingleOrDefault(t => t.Uid == uuid);
            if (tourney == null)
            {
                throw new NotFoundException("Tourney", uuid);
            }

            string messageId = Guid.NewGuid().ToString();
            string name = $"{DateTime.Now.ToString("yyyy-MM-dd")}/{messageId}";
            string url = await _storageService.SaveBlob(stream, uuid, name, contentType);

            Message m = new Message()
            {
                MessageId = messageId,
                From = "user",
                To = "cjoli",
                MessageType = "image",
                MediaUrl = url,
                MediaContentType = contentType,
                Time = DateTime.Now,
                Tourney = tourney,
                IsPublished = false,
                Destination = "inbound"
            };
            tourney.Messages.Add(m);

            if (!string.IsNullOrEmpty(tourney.WhatsappNotif) && !string.IsNullOrEmpty(tourney.WhatsappNumber))
            {
                try
                {
                    string variables = JsonSerializer.Serialize(new Dictionary<string, string> { { "1", m.From } });
                    string contentSid = _configuration["TwilioNotifContentSid"]!;
                    foreach (string notif in tourney.WhatsappNotif.Split(';'))
                    {
                        await _twilioService.SendMessageTemplate(contentSid: contentSid, contentVariables: variables, from: $"whatsapp:{tourney.WhatsappNumber}", to: $"whatsapp:{notif}");
                    }
                }
                catch (Exception e)
                {
                    _logger.LogError(e, "Unable to send notif");
                }
            }


            context.SaveChanges();
        }


    }
}
