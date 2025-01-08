

using cjoli.Server.Dtos;
using cjoli.Server.Models;

namespace cjoli.Server.Services.Rules
{
    public class HoglyRule : IRule
    {
        private readonly CJoliService _service;
        public HoglyRule(CJoliService service)
        {
            _service = service;
        }

        public int Win => 2;

        public int Neutral => 1;

        public int Loss => 0;

        public int Forfeit => -2;

        public bool HasPenalty => false;
        public bool HasForfeit => true;

        public Func<Squad, Comparison<Score>> ScoreComparison => (Squad squad) => (Score a, Score b) =>
        {
            var positionA = squad.Positions.Single(p => p.Id == a.PositionId);
            var positionB = squad.Positions.Single(p => p.Id == b.PositionId);


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
            diff = a.Loss.CompareTo(b.Loss);
            if (diff != 0)
            {
                CJoliService.UpdateSource(a, b, SourceType.loss, b.Loss - a.Loss, false);
                return diff;
            }

            return _service.DefaultScoreComparison(squad)(a,b);
        };

        public Action<Match, MatchDto> ApplyForfeit => (Match match, MatchDto dto) =>
        {
            match.ForfeitA = dto.ForfeitA;
            match.ForfeitB = dto.ForfeitB;
            match.ScoreA = dto.ForfeitA?0:4;
            match.ScoreB = dto.ForfeitB?0:4;
        };

        public Dictionary<int, Score> InitScoreSquad(Squad squad, List<ScoreSquad> scoreSquads)
        {
            return squad.Positions.ToDictionary(p => p.Id, p => new Score() { PositionId = p.Id, TeamId = p.Team?.Id ?? 0 });
        }
    }
}
