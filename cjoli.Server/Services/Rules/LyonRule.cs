

using cjoli.Server.Dtos;
using cjoli.Server.Models;

namespace cjoli.Server.Services.Rules
{
    public class LyonRule : IRule
    {
        private readonly CJoliService _service;
        public LyonRule(CJoliService service)
        {
            _service = service;
        }

        public int Win => 2;

        public int Neutral => 1;

        public int Loss => 0;

        public int Forfeit => 0;

        public double GoalFor => 0;

        public bool HasPenalty => false;
        public bool HasForfeit => false;
        public bool HasYoungest => false;

        public Func<Phase, Squad?, IRule, Comparison<Score>> ScoreComparison => (Phase phase, Squad? squad, IRule rule) => (Score a, Score b) =>
        {
            var positions = squad?.Positions ?? phase.Squads.SelectMany(s => s.Positions).ToList();

            var diff = a.Total.CompareTo(b.Total);
            if (diff != 0)
            {
                CJoliService.UpdateSource(a, b, SourceType.total, a.Total - b.Total, true);
                return -diff;
            }
            diff = a.Win.CompareTo(b.Win);
            if (diff != 0)
            {
                CJoliService.UpdateSource(a, b, SourceType.win, a.Win - b.Win, true);
                return -diff;
            }

            var positionA = positions.Single(p => p.Id == a.PositionId);
            var positionB = positions.Single(p => p.Id == b.PositionId);

            var allMatches = squad?.Matches ?? phase.Squads.SelectMany(s => s.Matches).ToList();
            var matches = allMatches.Where(m => (m.PositionA == positionA && m.PositionB == positionB) || (m.PositionB == positionA && m.PositionA == positionB)).OrderBy(m => m.Time).ToList();

            int goalFor = 0;
            int goalAgainst = 0;
            int goalDiff = 0;
            if (matches.Count > 0)
            {
                diff = 0;
                foreach (var match in matches)
                {
                    var userMatch = match.UserMatches.FirstOrDefault();
                    IMatch m = match.Done ? match : userMatch != null ? userMatch : match;
                    if (m.ScoreA > m.ScoreB || m.ForfeitB)
                    {
                        goalFor += match.PositionA == positionA ? m.ScoreA : -m.ScoreA;
                        goalAgainst += match.PositionA == positionA ? m.ScoreB : -m.ScoreB;
                        goalDiff += match.PositionA == positionA ? m.ScoreA - m.ScoreB : m.ScoreB - m.ScoreA;
                        diff += match.PositionA == positionA ? -1 : 1;
                    }
                    else if (m.ScoreB > m.ScoreA || m.ForfeitA)
                    {
                        goalFor += match.PositionB == positionA ? m.ScoreB : -m.ScoreB;
                        goalAgainst += match.PositionB == positionA ? m.ScoreA : -m.ScoreA;
                        goalDiff += match.PositionB == positionA ? m.ScoreB - m.ScoreA : m.ScoreA - m.ScoreB;
                        diff += match.PositionB == positionA ? -1 : 1;
                    }
                }
                if (diff != 0)
                {
                    CJoliService.UpdateSource(a, b, SourceType.direct, diff, false);
                    return diff;
                }
            }
            diff = a.GoalFor.CompareTo(b.GoalFor);
            if (diff != 0)
            {
                CJoliService.UpdateSource(a, b, SourceType.goalFor, a.GoalFor - b.GoalFor, true);
                return -diff;
            }

            if (goalFor != 0)
            {
                CJoliService.UpdateSource(a, b, SourceType.goalForDirect, goalFor, true);
                return -goalFor;
            }

            diff = a.GoalAgainst.CompareTo(b.GoalAgainst);
            if (diff != 0)
            {
                CJoliService.UpdateSource(a, b, SourceType.goalAgainst, b.GoalAgainst - a.GoalAgainst, false);
                return diff;
            }

            if (goalAgainst != 0)
            {
                CJoliService.UpdateSource(a, b, SourceType.goalAgainstDirect, -goalAgainst, false);
                return goalAgainst;
            }

            diff = a.GoalDiff.CompareTo(b.GoalDiff);
            if (diff != 0)
            {
                CJoliService.UpdateSource(a, b, SourceType.goalDiff, a.GoalDiff - b.GoalDiff, true);
                return -diff;
            }

            if (goalDiff != 0)
            {
                CJoliService.UpdateSource(a, b, SourceType.goalDiffDirect, goalDiff, true);
                return -goalDiff;
            }
            CJoliService.UpdateSource(a, b, SourceType.equal, 0, true);

            return 0;
        };

        public Action<Match, MatchDto> ApplyForfeit => _service.DefaultApplyForfeit;


        public Dictionary<int, Score> InitScoreSquad(Squad squad, List<ScoreSquad> scoreSquads, Dictionary<int, List<Score>> scorePhases, User? user)
        {
            return squad.Positions.ToDictionary(p => p.Id, p => new Score() { PositionId = p.Id, TeamId = p.Team?.Id ?? 0 });
        }

        public double Total(CJoliService.ScoreType type, double total, int score)
        {
            return _service.Total(type, this, total, score);
        }

    }
}
