using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace cjoli.Server.Models
{
    public enum EventType
    {
        Info, Resurfacing, Lunch, Friendly, Competition
    }

    public class Event
    {
        [Key]
        public int Id { get; set; }
        public required string Name { get; set; }
        public DateTime Time { get; set; }
        public required EventType EventType { get; set; }
        public string? Datas { get; set; }

        public IList<Position> Positions { get; set; } = new List<Position>();

        [SetsRequiredMembers]
        public Event()
        {
            Name = "";
            EventType = EventType.Info;
        }

    }
}
