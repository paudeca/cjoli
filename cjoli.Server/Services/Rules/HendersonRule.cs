using cjoli.Server.Dtos;
using cjoli.Server.Extensions;
using cjoli.Server.Models;

namespace cjoli.Server.Services.Rules
{
    public class HendersonRule : IRule
    {
        private readonly CJoliService _service;
        public HendersonRule(CJoliService service)
        {
            _service = service;
        }
        public int Win => 2;

        public int Neutral => 1;

        public int Loss => 0;

        public int Forfeit => 0;

        public bool HasPenalty => false;
        public bool HasForfeit => false;

        public Func<Squad, Comparison<Score>> ScoreComparison => _service.DefaultScoreComparison;
        public Action<Match, MatchDto> ApplyForfeit => _service.DefaultApplyForfeit;

        public Dictionary<int, Score> InitScoreSquad(Squad squad, List<ScoreSquad> scoreSquads, User? user)
        {
            var mapPositions = squad.Positions.Where(p => p.ParentPosition != null).ToDictionary(p => p.Id, p =>
            {
                var scoreSquad = scoreSquads.Single(s => s.SquadId == p.ParentPosition!.Squad.Id);
                var score = scoreSquad.Scores![p.ParentPosition!.Value - 1];
                return score.PositionId;
            });
            var scores = squad.Positions.ToDictionary(p => p.Id, p => new Score() { PositionId = p.Id, TeamId = p.Team?.Id ?? 0 });
            if (mapPositions.Count == 0)
            {
                return scores;
            }
            var positionIds = mapPositions.Select(kv => kv.Value);
            var tourney = squad.Phase.Tourney;
            var matches = tourney.Phases.SelectMany(p => p.Squads).SelectMany(s => s.Matches.Where(m => positionIds.Contains(m.PositionA.Id) && positionIds.Contains(m.PositionB.Id))).ToList();

            Dictionary<int, Score> initScores = positionIds.ToDictionary(p => p, p => new Score() { PositionId = p });
            matches.Aggregate(initScores, (acc, m) =>
            {
                var userMatch = m.UserMatches.OrderByDescending(u=>u.LogTime).FirstOrDefault(u=>u.User==user);
                bool useCustom = user != null && user.HasCustomEstimate();

                if ((userMatch == null || !useCustom) && !m.Done)
                {
                    return acc;
                }

                IMatch? match = m.Done ? m : userMatch;
                if (match == null)
                {
                    return acc;
                }
                var scoreA = initScores[m.PositionA.Id];
                var scoreB = initScores[m.PositionB.Id];

                _service.UpdateScore(scoreA, scoreB, null, match, this);
                return acc;
            });

            scores = squad.Positions.ToDictionary(p => p.Id, p =>
            {
                var id = mapPositions[p.Id];
                var score = initScores[id];
                score.PositionId = p.Id;
                return score;
            });
            return scores;
        }

    }
}
