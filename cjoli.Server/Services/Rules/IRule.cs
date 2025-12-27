
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
        Func<Phase, Squad?, IRule, Comparison<Score>> ScoreComparison { get; }
        Action<Match, MatchDto> ApplyForfeit { get; }


        Dictionary<int, Score> InitScoreSquad(Squad squad, List<ScoreSquad> scoreSquads, Dictionary<int, List<Score>> scorePhases, User? user);
        double Total(ScoreType type, double total, int score);

    }
}
