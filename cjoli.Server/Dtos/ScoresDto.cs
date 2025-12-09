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
        public Score? ScoreTourney { get; set; }
        public Score? ScoreSeason { get; set; }
        public Score? ScoreAllTime { get; set; }
        public BetDto? Bet { get; set; }

        //public Dictionary<string, Score> ScoreSeasons { get; set; } = new Dictionary<string, Score>();
        //public Dictionary<string, Score> ScoreCategories { get; set; } = new Dictionary<string, Score>();
        public List<Score> AllScores { get; set; } = new List<Score>();
        public Dictionary<int, List<Score>> AllScoresTeams { get; set; } = new Dictionary<int, List<Score>>();

        //public Dictionary<int, Dictionary<string, Score>> ScoreTeamsSeasons { get; set; } = new Dictionary<int, Dictionary<string, Score>>();
        //public Dictionary<int, Dictionary<string, Score>> ScoreTeamsCategories { get; set; } = new Dictionary<int, Dictionary<string, Score>>();

    }
}
