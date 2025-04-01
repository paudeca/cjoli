using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class Event
    {
        [Key]
        public int Id { get; set; }
        public required string Name { get; set; }
        public DateTime Time { get; set; }
        //public Phase Phase { get; set; }

        public IList<Position> Positions { get; set; } = new List<Position>();

    }
}
