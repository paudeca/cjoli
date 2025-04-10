﻿namespace cjoli.Server.Dtos
{
    public class TourneyConfigDto
    {

        public int Win { get; set; }
        public int Neutral { get; set; }
        public int Loss { get; set; }
        public int Forfeit { get; set; }
        public double GoalFor { get;set; }

        public bool HasPenalty { get; set; }
        public bool HasForfeit { get; set; }
        public bool HasYoungest { get; set; }
    }
}
