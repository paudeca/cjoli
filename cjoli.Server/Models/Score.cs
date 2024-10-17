﻿namespace cjoli.Server.Models
{
    public class Score
    {
        public int PositionId { get; set; }
        public int MatchId { get; set; }
        public int TeamId { get; set; }
        public int TeamAgainstId { get; set; }
        public int Game { get; set; }
        public int Win { get; set; }
        public int Neutral { get; set; }
        public int Loss { get; set; }
        public int Total { get; set; }
        public int GoalFor { get; set; }
        public int GoalAgainst { get; set; }
        public int GoalDiff { get; set; }
        public int Coefficient { get; set; }
        public int ShutOut { get; set; }
        public int Penalty { get; set; }
        public DateTime Time { get; set; }

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
