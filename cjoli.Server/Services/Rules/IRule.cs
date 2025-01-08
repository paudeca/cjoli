
using cjoli.Server.Dtos;
using cjoli.Server.Models;

namespace cjoli.Server.Services.Rules
{
    public interface IRule
    {
        int Win { get; }
        int Neutral { get; }
        int Loss { get; }
        int Forfeit { get; }
        bool HasPenalty { get; }
        bool HasForfeit { get; }
        Func<Squad, Comparison<Score>> ScoreComparison { get; }
        Action<Match, MatchDto> ApplyForfeit { get; }


        Dictionary<int, Score> InitScoreSquad(Squad squad, List<ScoreSquad> scoreSquads);
    }
}
