using AutoMapper;
using Azure;
using Azure.AI.OpenAI;
using cjoli.Server.Chat;
using cjoli.Server.Exceptions;
using cjoli.Server.Models;
using cjoli.Server.Models.AI;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace cjoli.Server.Services
{
    public class AIService
    {
        private readonly CJoliService _cjoliService;
        private readonly IMapper _mapper;
        private readonly OpenAIClient _openAIClient;

        private readonly Dictionary<string, string> LANGS = new Dictionary<string, string>{
            { "fr", "français" },
            { "en", "anglais" },
            { "pt", "portugais" },
            { "es", "espagnol" },
            { "de", "allemand" }
        };

        public AIService(CJoliService cjoliService, IMapper mapper, OpenAIClient openAIClient)
        {
            _cjoliService = cjoliService;
            _mapper = mapper;
            _openAIClient = openAIClient;
        }


        public ChatSession CreateSessionForChat(string uuid, string lang, string? login, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys.SingleOrDefault(t => t.Uid == uuid);
            if (tourney == null)
            {
                throw new NotFoundException("Tourney", uuid);
            }

            User? user = context.Users.Include(u => u.Configs.Where(c => c.Tourney == tourney)).ThenInclude(c => c.FavoriteTeam).SingleOrDefault(u => u.Login == login);
            UserConfig? config = user?.Configs[0];

            string prompt = "" +
@"Tu es assistant durant le tournois d'Hockey sur glace '" + tourney.Name + @"', tu réponds en " + LANGS[lang] + @" avec parfois des emoticones.
Les réponses ne doivent pas dépasser 5 phrases.
Ton premier message est un message d'accueil en soutenant une équipe. ";
            //Ton premier message doit indiquer que tu es dans une phase de Beta, et que les réponses ne sont pas fiables. ";
            if (config != null && config.FavoriteTeam != null)
            {
                prompt += $"Ton équipe préféré est {config.FavoriteTeam.FullName ?? config.FavoriteTeam.Name}.";
            }
            return CreateSession(uuid, lang, login, prompt, context);
        }

        public async Task<string?> Prompt(string uuid, string lang, string? login, CJoliContext context)
        {
            var session = CreateSessionForPrompt(uuid, lang, login, "Tu dois les dernières actualités du tournoi ou du dernier match. Ne prendre en compte uniquement les matches passées.", context);
            return await PromptMessage(session);
        }


        public ChatSession CreateSessionForPrompt(string uuid, string lang, string? login, string initPrompt, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys.SingleOrDefault(t => t.Uid == uuid);
            if (tourney == null)
            {
                throw new NotFoundException("Tourney", uuid);
            }

            User? user = context.Users.Include(u => u.Configs.Where(c => c.Tourney == tourney)).ThenInclude(c => c.FavoriteTeam).SingleOrDefault(u => u.Login == login);
            UserConfig? config = user?.Configs[0];

            string prompt = "" +
@"Tu es assistant durant le tournois d'Hockey sur glace '" + tourney.Name + @"', tu réponds en " + LANGS[lang] + @" avec parfois des emoticones.
Les réponses ne doivent pas dépasser 3 phrases.
" + initPrompt + ". ";
            //Ton premier message doit indiquer que tu es dans une phase de Beta, et que les réponses ne sont pas fiables. ";
            if (config != null && config.FavoriteTeam != null)
            {
                prompt += $"Ton équipe préféré est {config.FavoriteTeam.FullName ?? config.FavoriteTeam.Name}.";
            }
            return CreateSession(uuid, lang, login, prompt, context);
        }


        private ChatSession CreateSession(string uuid, string lang, string? login, string prompt, CJoliContext context)
        {
            ChatSession session = new();
            session.Messages.Add(new ChatRequestSystemMessage(prompt));

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


        public async Task<string?> PromptMessage(ChatSession session)
        {
            var options = new ChatCompletionsOptions()
            {
                DeploymentName = "gpt-4o",
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
                    return reply;
                }
            }
            return null;
        }
    }
}
