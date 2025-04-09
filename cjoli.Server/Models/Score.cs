namespace cjoli.Server.Models
{
    public class Score
    {
        public int PositionId { get; set; }
        public int Rank { get; set; }
        public int MatchId { get; set; }
        public int TeamId { get; set; }
        public int TeamAgainstId { get; set; }
        public int Game { get; set; }
        public int Win { get; set; }
        public int Neutral { get; set; }
        public int Loss { get; set; }
        public double Total { get; set; }
        public int GoalFor { get; set; }
        public int GoalAgainst { get; set; }
        public int GoalDiff { get; set; }
        public int Coefficient { get; set; }
        public int ShutOut { get; set; }
        public int Penalty { get; set; }
        public DateTime Time { get; set; }
        public Dictionary<int, ScoreSource> Sources { get; set; } = new Dictionary<int, ScoreSource>();
        public Dictionary<string, RankInfo> Ranks { get; set; } = new Dictionary<string, RankInfo>();

        public Score Clone()
        {
            var score = new Score()
            {
                PositionId=PositionId,
                Rank=Rank,
                MatchId=MatchId,
                TeamId=TeamId,
                TeamAgainstId=TeamAgainstId,
                Time=Time
            };
            score.Merge(this);
            return score;
        }

        public void Merge(Score score)
        {
            Total += score.Total;
            Game += score.Game;
            Win += score.Win;
            Neutral += score.Neutral;
            Loss += score.Loss;
            GoalFor += score.GoalFor;
            GoalAgainst += score.GoalAgainst;
            GoalDiff += score.GoalDiff;
            ShutOut += score.ShutOut;
            Penalty += score.Penalty;
        }

    }
}
