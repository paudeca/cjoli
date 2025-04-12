namespace cjoli.Server.Models
{
    public interface IMatch
    {
        public int ScoreA { get; set; }
        public int ScoreB { get; set; }
        public bool ForfeitA { get; set; }
        public bool ForfeitB { get; set; }
        public DateTime Time { get; }
    }

    public interface IPenalty
    {
        public int PenaltyA { get; set; }
        public int PenaltyB { get; set; }
    }

}
