﻿using Azure;
using Azure.AI.OpenAI;
using cjoli.Server.Datas;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using cjoli.Server.Controllers;
using System.Text;
using AutoMapper;
using cjoli.Server.Dtos;
using System.Text.Json.Serialization;
using cjoli.Server.Models;
using cjoli.Server.Exceptions;
using cjoli.Server.Models.AI;

namespace cjoli.Server.Services
{
    public class AIService
    {
        private readonly CJoliService _cjoliService;
        private readonly IMapper _mapper;
        private readonly OpenAIClient _openAIClient;
        private readonly IConfiguration _configuration;
        private readonly Dictionary<string, FunctionDefinition> _functions = new Dictionary<string, FunctionDefinition>();

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

            var askDatabase = new FunctionDefinition()
            {
                Name = "ask_database",
                Description = @"
Utiliser cette fonction pour répondre aux question sur le tournoi 'Scooby Ice 2024'.
L'identifiant du tounoi (uid) est 'scooby2024'.
L'entrée doit être une requête Mysql bien formée.",
                //Description = "Use this function to answer user questions about . Input should be a fully formed MySQL query.",
                Parameters = BinaryData.FromObjectAsJson(new
                {
                    Type = "object",
                    Properties = new
                    {
                        Query = new
                        {
                            Type = "string",
                            Description = @"
SQL query extracting info to answer the user's question. 
SQL should be written using this database schema: 
Table: cjoli.tourneys
Columns: Id, Name, Uid, StartTime, EndTime, Category, Season
Column Uid is the column to find the tourney
Table: cjoli.teams
Columns: Id, Name, Logo, Youngest, ShortName
Table: cjoli.teamtourney
Columns: TeamsId, TourneysId
Table: cjoli.phase
Columns: Id, Name, Time, TourneyId
Table: cjoli.squad
Columns: Id, Name, PhaseId
Table: cjoli.position
Column: Id, Value, TeamId, squadId, Name, Short, Penalty
Table: cjoli.match
Column: Id, PositionAId, PositionBId, ScoreA, ScoreB, Time, squadId, Done, ForfeitA, ForfeitB, Location, Shot
The query should be returned in plain text, not in JSON."
                        }
                    },
                    Required = new[] { "query" },
                }, new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }),
            };
            _functions.Add(askDatabase.Name, askDatabase);
        }


        public ChatSession CreateSession(string uuid, string lang, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys.SingleOrDefault(t => t.Uid == uuid);
            if(tourney== null)
            {
                throw new NotFoundException("Tourney", uuid);
            }
            ChatSession session = new ();
            session.Messages.Add(new ChatRequestSystemMessage(""+
@"Tu es assistant durant le tournois d'Hockey sur glace '"+tourney.Name+@"', tu réponds en " + LANGS[lang] +@" avec parfois des emoticones.
Ton premier message doit indiquer que tu es dans une phase de Beta, et que les réponses ne sont pas fiables.
Ton équipe préféré est les Lions de Wasquehal."));

            Ranking ranking = _cjoliService.GetRanking(uuid, null, context);
            var dto = _mapper.Map<RankingDto>(ranking);

            _cjoliService.AffectationTeams(dto);
            _cjoliService.CalculateHistory(dto);

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

            string json = JsonSerializer.Serialize(tourneyAI, new JsonSerializerOptions() { 
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase, 
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull });


            /*session.Messages.Add(new ChatRequestSystemMessage(""+
@"Description du modèle:
- Le json suivant décrit le tournoi(tourney) avec la catégorie(category), la saison(season), et la date de début(startTime) et de fin(endTime).
- Le tournoi contient une liste d'équipes(team) et des phases(phase).
- Une phase contient une liste de groupes(squad).
- Un groupe(squad) contient une liste de positions et une liste de match.
- Une position représente une équipe dans un squad, elle peut être affecté à une équipe(team) ou sinon dipose d'un nom.
- Un match est entre 2 positions (positionA et positionB).
- Une équipe(team) dispose d'un nom, logo et un alias"));*/

            session.Messages.Add(new ChatRequestSystemMessage("Utilise le json suivant pour donner des informations.\n" + json));

            return session;
        }


        public async Task PromptMessage(ChatSession session, CJoliContext context,int loop=0)
        {
            if(loop>3)
            {
                throw new Exception("To many loop, stop it");
            }
            var options = new ChatCompletionsOptions()
            {
                DeploymentName = "gpt-3.5-turbo",
            };
            session.Messages.ForEach(options.Messages.Add);
            //options.Functions.Add(_functions["ask_database"]);


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
                    if (responseChoice.Message.FunctionCall.Name == "ask_database")
                    {
                        string arguments = responseChoice.Message.FunctionCall.Arguments;
                        Query? query = JsonSerializer.Deserialize<Query>(arguments);
                        if(query!=null)
                        {
                            var result = ExecuteQuery(query.query, context);
                            string a = JsonSerializer.Serialize(
                                    result,
                                    new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
                            var functionResponseMessage = new ChatRequestFunctionMessage(
                                name: responseChoice.Message.FunctionCall.Name,
                                content: JsonSerializer.Serialize(
                                    result,
                                    new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
                            session.Messages.Add(functionResponseMessage);

                            await PromptMessage(session, context,loop+1);
                        }
                    }
                }
            }
        }

        private QueryResult ExecuteQuery(string query,CJoliContext context)
        {
            QueryResult result = new QueryResult();
            //List<string> result = new List<string>();
            MySqlConnection conn = new MySqlConnection(context.Database.GetConnectionString());
            try
            {
                conn.Open();
                MySqlCommand cmd = new MySqlCommand(query, conn);
                MySqlDataReader reader = cmd.ExecuteReader();

                result.Columns = Enumerable.Range(0, reader.FieldCount).Select(reader.GetName).ToList();
                //result.Add(string.Join(";", columns));
                while (reader.Read())
                {
                    var row = Enumerable.Range(0, reader.FieldCount).Select(reader.GetValue).ToArray();
                    result.Values.Add(row);
                    //result.Add(string.Join(";", row));
                }
                reader.Close();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
            conn.Close();
            return result;
            //return string.Join("\r\n", result);
        }

        public async Task<string> Test(CJoliContext context)
        {
            OpenAIClient client = new OpenAIClient("xxxxx");

            var askDatabase = new FunctionDefinition()
            {
                Name = "ask_database",
                Description = "Use this function to answer user questions about music. Input should be a fully formed MySQL query.",
                Parameters = BinaryData.FromObjectAsJson(new
                {
                    Type = "object",
                    Properties = new
                    {
                        Query = new
                        {
                            Type = "string",
                            Description = @"SQL query extracting info to answer the user's question. 
SQL should be written using this database schema: 
Table: cjoli.tourneys
Columns: Id, Name, Uid, StartTime, EndTime, Category, Season
Column Uid is an alias like Name
Table: cjoli.teams
Columns: Id, Name, Logo, Youngest, ShortName
Table: cjoli.teamtourney
Columns: TeamsId, TourneysId
Table: cjoli.phase
Columns: Id, Name, Time, TourneyId
Table: cjoli.squad
Columns: Id, Name, PhaseId
Table: cjoli.position
Column: Id, Value, TeamId, squadId, Name, Short, Penalty
Table: cjoli.match
Column: Id, PositionAId, PositionBId, ScoreA, ScoreB, Time, squadId, Done, ForfeitA, ForfeitB, Location, Shot
The query should be returned in plain text, not in JSON."
                        }
                    },
                    Required = new[] { "query" },
                },new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }),
            };

            var findPosition = new FunctionDefinition()
            {
                Name = "find_position",
                Description = "Use this function find why team is begin a position. Input should be a fully formed MySQL query.",
                Parameters = BinaryData.FromObjectAsJson(new
                {
                    Type = "object",
                    Properties = new
                    {
                        Query = new
                        {
                            Type = "string",
                            Description = @"SQL query extracting info to find the team. 
SQL should be written using this database schema: 
Table: cjoli.tourneys
Columns: Id, Name, Uid, StartTime, EndTime, Category, Season
Table: cjoli.teams
Columns: Id, Name, Logo, Youngest, ShortName
Table: cjoli.teamtourney
Columns: TeamsId, TourneysId
Table: cjoli.phase
Columns: Id, Name, Time, TourneyId
Table: cjoli.squad
Columns: Id, Name, PhaseId
Table: cjoli.position
Column: Id, Value, TeamId, squadId, Name, Short, Penalty
Table: cjoli.match
Column: Id, PositionAId, PositionBId, ScoreA, ScoreB, Time, squadId, Done, ForfeitA, ForfeitB, Location, Shot
The query should be returned in plain text, not in JSON."
                        }
                    },
                    Required = new[] { "query" },
                }, new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }),
            };


            var conversationMessages = new List<ChatRequestMessage>()
            {
                //new ChatRequestSystemMessage(@"You are an AI assistant that helps people find information and speak only in French."),
                //new ChatRequestUserMessage(@"What is the weather like in Boston?"),
                //new ChatRequestUserMessage(@"How many teams there are in the last tourney ?")
                new ChatRequestUserMessage(@"Quel est le prochain match du tournoi?")
            };

            var options = new ChatCompletionsOptions()
            {
                DeploymentName = "gpt-3.5-turbo",//"myaideploy",
                //Temperature = (float)0.7,
                //MaxTokens = 800,

                //NucleusSamplingFactor = (float)0.95,
                //FrequencyPenalty = 0,
                //PresencePenalty = 0,
            };
            conversationMessages.ForEach(options.Messages.Add);
            //options.Functions.Add(getWeatherFuntionDefinition);
            options.Functions.Add(askDatabase);
            options.Functions.Add(findPosition);


            Response<ChatCompletions> response = await client.GetChatCompletionsAsync(options);

            ChatChoice responseChoice = response.Value.Choices[0];
            if (responseChoice.FinishReason == CompletionsFinishReason.FunctionCall)
            {
                // Include the FunctionCall message in the conversation history
                options.Messages.Add(new ChatRequestAssistantMessage(responseChoice.Message.Content)
                {
                    FunctionCall = responseChoice.Message.FunctionCall,
                });
                //options.Messages.Add(new ChatRequestFunctionMessage(responseChoice));

                if (responseChoice.Message.FunctionCall.Name == "ask_database")
                {
                    // Validate and process the JSON arguments for the function call
                    string unvalidatedArguments = responseChoice.Message.FunctionCall.Arguments;
                    Query query = JsonSerializer.Deserialize<Query>(unvalidatedArguments);
                    //query.query = "SELECT Id,Category,StartTime,EndTime,Name,Uid,Season FROM Tourneys";


                    MySqlConnection conn = new MySqlConnection(context.Database.GetConnectionString());
                    try
                    {
                        Console.WriteLine("Connecting to MySQL...");
                        conn.Open();

                        string sql = query.query;
                        MySqlCommand cmd = new MySqlCommand(sql, conn);
                        MySqlDataReader rdr = cmd.ExecuteReader();

                        while (rdr.Read())
                        {
                            Console.WriteLine(rdr[0] + " -- " + rdr[1]);
                        }
                        rdr.Close();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.ToString());
                    }

                    conn.Close();

                    var functionResultData = (object)null; // GetYourFunctionResultData(unvalidatedArguments);
                                                           // Here, replacing with an example as if returned from GetYourFunctionResultData
                    functionResultData = "Id:1, PositionAId:1, PositionBId:5, ScoreA:2, ScoreB:3, Time:2024-05-18 11:00:00.000000, SquadId:1, Done:1,ForfeitA:0, ForfeitB:0, Location: GlaceA, Shot:0";
                    // Serialize the result data from the function into a new chat message with the 'Function' role,
                    // then add it to the messages after the first User message and initial response FunctionCall
                    var functionResponseMessage = new ChatRequestFunctionMessage(
                        name: responseChoice.Message.FunctionCall.Name,
                        content: JsonSerializer.Serialize(
                            functionResultData,
                            new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
                    options.Messages.Add(functionResponseMessage);
                    // Now make a new request using all three messages in conversationMessages
                }
            }

            response = await client.GetChatCompletionsAsync(options);
            responseChoice = response.Value.Choices[0];

            options.Messages.Add(new ChatRequestAssistantMessage(responseChoice.Message.Content));
            options.Messages.Add(new ChatRequestUserMessage(@"Quel équipe est à la position 1?"));
            response = await client.GetChatCompletionsAsync(options);

            return response.Value.Choices.FirstOrDefault().Message.Content ?? "no response";
            //return "ok";
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

    public class ReplyMessageEvent :EventArgs
    {
        public required string Message { get; set; }
    }

    public class Query
    {
        public string query { get; set; }
    }

    public class QueryResult
    {
        public List<string> Columns { get; set; }
        public List<object[]> Values { get; set; } = new List<object[]>();
    }
}
