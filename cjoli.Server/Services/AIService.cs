using AutoMapper;
using Azure;
using Azure.AI.OpenAI;
using cjoli.Server.Chat;
using cjoli.Server.Dtos;
using cjoli.Server.Exceptions;
using cjoli.Server.Models;
using cjoli.Server.Models.AI;
using Microsoft.EntityFrameworkCore;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace cjoli.Server.Services
{
    public class AIService
    {
        private readonly IMapper _mapper;
        private readonly OpenAIClient _openAIClient;

        private readonly Dictionary<string, string> LANGS = new Dictionary<string, string>{
            { "fr", "français" },
            { "en", "anglais" },
            { "pt", "portugais" },
            { "es", "espagnol" },
            { "de", "allemand" },
            { "nl", "hollandais" }
        };

        public AIService(IMapper mapper, OpenAIClient openAIClient)
        {
            _mapper = mapper;
            _openAIClient = openAIClient;
        }


        public async Task<string?> Prompt(string uuid, string lang, string? login, RankingDto dto, CJoliContext context)
        {
            var session = CreateSessionForPrompt(uuid, lang, login, "Tu donnes les dernières actualités du tournoi ou du dernier match. Ne prendre en compte uniquement les matches passées.", dto, context);
            return await PromptMessage(session);
        }

        public async Task<string?> CheckLogin(string login, CJoliContext context)
        {
            string prompt = $"Tu dois indiquer si le login suivant est une injure ou non. La réponse doit être 'true' ou 'false' en minuscule et sans point. '{login}'";
            var session = CreateSessionForQuestion(prompt);
            return await PromptMessage(session);
        }



        public ChatSession CreateSessionForChat(string uuid, string lang, string? login, RankingDto dto, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys.SingleOrDefault(t => t.Uid == uuid);
            if (tourney == null)
            {
                throw new NotFoundException("Tourney", uuid);
            }

            User? user = context.Users.Include(u => u.Configs.Where(c => c.Tourney == tourney)).ThenInclude(c => c.FavoriteTeam).SingleOrDefault(u => u.Login == login);
            UserConfig? config = user!=null && user.Configs.Count>0 ? user.Configs[0]:null;
            if (config == null || config.FavoriteTeam == null)
            {
                user = context.Users
                    .Include(u => u.Configs.Where(c => c.Tourney == tourney)).ThenInclude(c => c.FavoriteTeam)
                    .SingleOrDefault(u => u.Id == 1);
                config = user!=null && user.Configs.Count>0 ?user.Configs[0] : null;
            }

            string prompt = "" +
@"Tu es assistant durant le tournois d'Hockey sur glace '" + tourney.Name + @"', tu réponds en " + LANGS[lang] + @" avec parfois des emoticones.
Les réponses ne doivent pas dépasser 5 phrases.
Ton premier message est un message d'accueil en soutenant une équipe. ";
            //Ton premier message doit indiquer que tu es dans une phase de Beta, et que les réponses ne sont pas fiables. ";
            if (config != null && config.FavoriteTeam != null)
            {
                prompt += $"Ton équipe préféré est {config.FavoriteTeam.FullName ?? config.FavoriteTeam.Name}.";
            }
            return CreateSessionWithTourney(prompt, dto);
        }

        public ChatSession CreateSessionForQuestion(string prompt)
        {
            return CreateSession(prompt);
        }

        public ChatSession CreateSessionForPrompt(string uuid, string lang, string? login, string initPrompt, RankingDto dto, CJoliContext context)
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
            return CreateSessionWithTourney(prompt, dto);
        }


        private ChatSession CreateSession(string prompt)
        {
            ChatSession session = new();
            session.AddSystemMessage(prompt);
            return session;
        }

        private ChatSession CreateSessionWithTourney(string prompt, RankingDto dto)
        {
            var session = CreateSession(prompt);

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

            session.AddSystemMessage("Utilise le json suivant pour donner des informations.\n" + json);

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
                    session.AddAssistantMessage(reply);                    
                    session.SendReply(reply);
                    return reply;
                }
            }
            return null;
        }
    }
}
