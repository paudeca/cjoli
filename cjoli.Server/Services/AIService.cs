using AutoMapper;
using Azure;
using Azure.AI.OpenAI;
using cjoli.Server.Exceptions;
using cjoli.Server.Models;
using cjoli.Server.Models.AI;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace cjoli.Server.Services
{
    public class AIService
    {
        private readonly CJoliService _cjoliService;
        private readonly IMapper _mapper;
        private readonly OpenAIClient _openAIClient;
        private readonly IConfiguration _configuration;

        private readonly Dictionary<string, string> LANGS = new Dictionary<string, string>{
            { "fr", "français" },
            { "en", "anglais" },
            { "pt", "portugais" },
            { "es", "espagnol" },
            { "de", "allemand" }
        };

        public AIService(CJoliService cjoliService, IMapper mapper, IConfiguration configuration)
        {
            _cjoliService = cjoliService;
            _mapper = mapper;
            _configuration = configuration;

            _openAIClient = new OpenAIClient(_configuration["OpenAIKey"]);
        }


        public ChatSession CreateSession(string uuid, string lang, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys.SingleOrDefault(t => t.Uid == uuid);
            if (tourney == null)
            {
                throw new NotFoundException("Tourney", uuid);
            }
            ChatSession session = new();
            session.Messages.Add(new ChatRequestSystemMessage("" +
@"Tu es assistant durant le tournois d'Hockey sur glace '" + tourney.Name + @"', tu réponds en " + LANGS[lang] + @" avec parfois des emoticones.
Ton premier message doit indiquer que tu es dans une phase de Beta, et que les réponses ne sont pas fiables.
Ton équipe préféré est les Lions de Wasquehal."));

            var dto = _cjoliService.CreateRanking(uuid, null, context);

            var tourneyAI = _mapper.Map<TourneyAI>(dto.Tourney);
            tourneyAI.Phases.SelectMany(p => p.Squads).SelectMany(s => s.Matches).ToList().ForEach(m =>
            {
                m.TeamA = tourneyAI.Teams.Single(t => t.Id == m.TeamIdA).Name;
                m.TeamB = tourneyAI.Teams.Single(t => t.Id == m.TeamIdB).Name;
            });
            tourneyAI.Ranks.ForEach(r =>
            {
                r.Team = tourneyAI.Teams.SingleOrDefault(t => t.Id == r.TeamId)?.Name;
            });
            dto.Scores.ScoreTeams.ToList().ForEach(kv =>
            {
                var score = new ScoreAI();
                score.Merge(kv.Value);
                score.Team = tourneyAI.Teams.Single(t => t.Id == kv.Key).Name;
                tourneyAI.Scores.Add(score);
            });

            string json = JsonSerializer.Serialize(tourneyAI, new JsonSerializerOptions()
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            });

            session.Messages.Add(new ChatRequestSystemMessage("Utilise le json suivant pour donner des informations.\n" + json));

            return session;
        }


        public async Task PromptMessage(ChatSession session, CJoliContext context, int loop = 0)
        {
            if (loop > 3)
            {
                throw new Exception("To many loop, stop it");
            }
            var options = new ChatCompletionsOptions()
            {
                DeploymentName = "gpt-3.5-turbo",
            };
            session.Messages.ForEach(options.Messages.Add);


            Response<ChatCompletions> response = await _openAIClient.GetChatCompletionsAsync(options);
            ChatChoice? responseChoice = response.Value.Choices.FirstOrDefault();
            if (responseChoice != null)
            {
                if (responseChoice.FinishReason == CompletionsFinishReason.Stopped)
                {
                    string reply = responseChoice.Message.Content;
                    session.Messages.Add(new ChatRequestAssistantMessage(reply));
                    session.SendReply(reply);
                }
                else if (responseChoice.FinishReason == CompletionsFinishReason.FunctionCall)
                {
                    session.Messages.Add(new ChatRequestAssistantMessage(responseChoice.Message.Content)
                    {
                        FunctionCall = responseChoice.Message.FunctionCall,
                    });
                }
            }
        }
    }

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

    public class ReplyMessageEvent : EventArgs
    {
        public required string Message { get; set; }
    }

}
