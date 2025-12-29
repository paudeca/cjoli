using cjoli.Server.Exceptions;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace cjoli.Server.Server
{

    public enum ServerMessageType
    {
        users,
        selectTourney,
        updateRanking,
        estimation
    }

    public abstract class ServerMessage
    {
        [JsonPropertyName("type")]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ServerMessageType Type { get; set; }

        public ServerMessage(ServerMessageType type)
        {
            Type = type;
        }

        public static ServerMessage Parse(string message)
        {
            var json = JsonNode.Parse(message) ?? throw new IllegalArgumentException("invalid message");
            var type = Enum.Parse(typeof(ServerMessageType), json["type"]!.GetValue<string>());
            switch (type)
            {
                case ServerMessageType.users:
                    return new UsersMessage(json["value"]!.GetValue<int>());
                case ServerMessageType.selectTourney:
                    return new SelectTourneyMessage(json["uid"]!.GetValue<string>());
            }
            throw new IllegalArgumentException("invalid type");
        }
    }

    public class UsersMessage : ServerMessage
    {
        [JsonPropertyName("value")]
        public int Value { get; set; }

        public UsersMessage(int value) : base(ServerMessageType.users)
        {
            Value = value;
        }
    }

    public class SelectTourneyMessage : ServerMessage
    {
        [JsonPropertyName("uid")]
        public string Uid { get; set; }
        public SelectTourneyMessage(string uid) : base(ServerMessageType.selectTourney)
        {
            Uid = uid;
        }
    }

    public class UpdateRankingMessage : ServerMessage
    {
        public UpdateRankingMessage() : base(ServerMessageType.updateRanking)
        {
        }
    }

    public class EstimationMessage : ServerMessage
    {
        [JsonPropertyName("started")]
        public bool Started { get; set; }
        public EstimationMessage(bool started) : base(ServerMessageType.estimation)
        {
            Started = started;
        }
    }

}
