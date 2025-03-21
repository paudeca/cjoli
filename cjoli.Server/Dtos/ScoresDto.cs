﻿using cjoli.Server.Models;

namespace cjoli.Server.Dtos
{
    public class ScoresDto
    {
        public List<ScoreSquad> ScoreSquads { get; set; } = new List<ScoreSquad>();
        public Dictionary<int, Score> ScoreTeams { get; set; } = new Dictionary<int, Score>();
        public required Score ScoreTourney { get; set; }
        public required BetDto Bet {  get; set; }
    }
}
