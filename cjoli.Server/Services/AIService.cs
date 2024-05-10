using Azure;
using Azure.AI.OpenAI;
using cjoli.Server.Datas;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

namespace cjoli.Server.Services
{
    public class AIService
    {
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

    public class Query
    {
        public string query { get; set; }
    }
}
