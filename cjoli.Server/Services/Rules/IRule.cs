
using cjoli.Server.Dtos;
using cjoli.Server.Models;
using static cjoli.Server.Services.CJoliService;

namespace cjoli.Server.Services.Rules
{
    public interface IRule
    {
        int Win { get; }
        int Neutral { get; }
        int Loss { get; }
        int Forfeit { get; }
        double GoalFor { get; }
        bool HasPenalty { get; }
        bool HasForfeit { get; }
        bool HasYoungest { get; }
        Func<Squad, Comparison<Score>> ScoreComparison { get; }
        Action<Match, MatchDto> ApplyForfeit { get; }


        Dictionary<int, Score> InitScoreSquad(Squad squad, List<ScoreSquad> scoreSquads, User? user);
        double Total(ScoreType type, double total, int score);

    }
}
