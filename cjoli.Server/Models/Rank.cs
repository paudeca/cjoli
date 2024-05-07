using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class Rank
    {
        [Key]
        public int Id { get; set; }
        public int Order { get; set; }
        public required Tourney Tourney { get; set; }
        public required Squad Squad { get; set; }
        public int Value {  get; set; }
        public string? Name { get; set; }
    }
}
