﻿namespace cjoli.Server.Dtos
{
    public class UserMatchDto
    {
        public int Id { get; set; }
        public int MatchId { get; set; }
        public int UserID { get; set; }
        public int ScoreA { get; set; }
        public int ScoreB { get; set; }
        public bool ForfeitA { get; set; }
        public bool ForfeitB { get; set; }
    }
}
