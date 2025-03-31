using cjoli.Server.Exceptions;
using cjoli.Server.Models;
using cjoli.Server.Models.AI;
using cjoli.Server.Models.Twilio;
using Microsoft.EntityFrameworkCore;
using System;

namespace cjoli.Server.Services
{
    public class MessageService
    {
        private readonly TwilioService _twilioService;
        private readonly StorageService _storageService;
        private readonly CJoliService _cjoliService;
        private readonly AIService _aiService;

        public MessageService(TwilioService twilioService, StorageService storageService, CJoliService cjoliService, AIService aIService) {
            _twilioService = twilioService;
            _storageService = storageService;
            _cjoliService = cjoliService;
            _aiService = aIService;
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

                //await _twilioService.SendMessage(body: "A new image from 0645802109 has been uploaded, please validate it.", from: message.To, to: "whatsapp:+33664256757", tourney: tourney);
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
    }
}
