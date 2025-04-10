using cjoli.Server.Models;

namespace cjoli.Server.Dtos
{
    public class ScoresDto
    {
        public List<ScoreSquad> ScoreSquads { get; set; } = new List<ScoreSquad>();
        public Dictionary<int, List<Score>> ScorePhases { get; set; } = new Dictionary<int, List<Score>>();
        public Dictionary<int, Score> ScoreTeams { get; set; } = new Dictionary<int, Score>();
        public Dictionary<int, Score> ScoreTeamsSeason { get; set; } = new Dictionary<int, Score>();
        public Dictionary<int, Score> ScoreTeamsAllTime { get; set; } = new Dictionary<int, Score>();
        public required Score ScoreTourney { get; set; }
        public Score? ScoreSeason { get; set; }
        public Score? ScoreAllTime { get; set; }
        public required BetDto Bet {  get; set; }
    }
}
