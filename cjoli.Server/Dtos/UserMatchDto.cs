using cjoli.Server.Models;

namespace cjoli.Server.Dtos
{
    public class UserMatchDto : IMatch
    {
        public int Id { get; set; }
        public int MatchId { get; set; }
        public int UserID { get; set; }
        public int ScoreA { get; set; }
        public int ScoreB { get; set; }
        public bool ForfeitA { get; set; }
        public bool ForfeitB { get; set; }
        public DateTime LogTime { get; set; }
        public DateTime Time { get; set; }
        public int BetScore { get; set; }
        public bool BetPerfect { get; set; }
        public bool BetWinner { get; set; }
        public bool BetDiff { get; set; }
        public bool BetGoal { get; set; }
    }
}
