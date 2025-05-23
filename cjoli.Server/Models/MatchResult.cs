﻿using System.ComponentModel.DataAnnotations;

namespace cjoli.Server.Models
{

    public interface IMatchResult
    {
        public int Win { get; set; }
        public int Loss { get; set; }
        public int Neutral { get; set; }
        public int GoalFor { get; set; }
        public int GoalAgainst { get; set; }
        public int GoalDiff { get; set; }
        public int ShutOut { get; set; }
        public Match Match { get; set; }
    }


    public class MatchResultBase : IMatchResult
    {
        public int Win { get; set; }
        public int Loss { get; set; }
        public int Neutral { get; set; }
        public int GoalFor { get; set; }
        public int GoalAgainst { get; set; }
        public int GoalDiff { get; set; }
        public int ShutOut { get; set; }
        public required Match Match { get; set; }
    }


    public class MatchResult : IMatchResult
    {
        [Key]
        public int Id { get; set; }

        public required Team Team { get; set; }
        public required Team TeamAgainst { get; set; }
        public required Match Match { get; set; }

        public int Win { get; set; }
        public int Neutral { get; set; }
        public int Loss { get; set; }
        public int GoalFor { get; set; }
        public int GoalAgainst { get; set; }
        public int GoalDiff { get; set; }
        public int ShutOut { get; set; }

    }
}
