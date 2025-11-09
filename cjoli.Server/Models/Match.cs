using AutoMapper.Configuration.Annotations;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace cjoli.Server.Models
{

    public enum MatchType
    {
        Normal,
        Final,
        Semi,
        Quarter,
        Match8,
        Match16,
        Match32
    }

    public class Match : IMatch, IPenalty
    {
        [Key]
        public int Id { get; set; }
        public string? Name { get; set; }
        public bool Done { get; set; }
        public required Position PositionA { get; set; }
        public required Position PositionB { get; set; }
        public int ScoreA { get; set; }
        public int ScoreB { get; set; }
        public bool ForfeitA { get; set; }
        public bool ForfeitB { get; set; }
        public bool Shot { get; set; }
        public string? Location { get; set; }
        public DateTime Time { get; set; }
        public Squad? Squad { get; set; }
        public int PenaltyA { get; set; }
        public int PenaltyB { get; set; }
        public string? Tournify { get; set; }
        public Position? Winner { get; set; }
        public MatchType MatchType { get; set; }
        public int MatchOrder { get; set; }

        [Ignore]
        public bool WinnerA => Winner == PositionA;
        [Ignore]
        public bool WinnerB => Winner == PositionB;


        public IList<MatchEstimate> Estimates { get; set; } = new List<MatchEstimate>();
        public IList<UserMatch> UserMatches { get; set; } = new List<UserMatch>();
        public IList<MatchResult> MatchResults { get; set; } = new List<MatchResult>();

        public static MatchType GetMatchTypeFromNum(int round)
        {
            switch (round)
            {
                case 1: return MatchType.Final;
                case 2: return MatchType.Semi;
                case 3: return MatchType.Quarter;
                case 4: return MatchType.Match8;
                case 5: return MatchType.Match16;
                case 6: return MatchType.Match32;
                default: return MatchType.Normal;
            }
        }
    }
}
