﻿using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{
    public class Team
    {
        [Key]
        public int Id { get; set; }
        public required string Name { get; set; }
        public Tourney? Tourney { get; set; }

        public virtual IList<Position> Positions { get; set; } = new List<Position>();
    }
}
