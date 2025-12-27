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

        public double GoalFor => 0;

        public bool HasPenalty => false;
        public bool HasForfeit => false;
        public bool HasYoungest => true;


        public Func<Phase, Squad?, IRule, Comparison<Score>> ScoreComparison => _service.DefaultScoreComparison;

        public Action<Match, MatchDto> ApplyForfeit => _service.DefaultApplyForfeit;

        private Position FindParentPosition(Position position, IList<ScoreSquad> squadScores, IList<Score> phaseScores)
        {
            if (position.ParentPosition != null && (position.ParentPosition.Squad != null || position.ParentPosition.Phase != null))
            {
                IList<Score> scores;
                IEnumerable<Position> positions;
                if (position.ParentPosition.Squad != null)
                {
                    var squad = position.ParentPosition.Squad;
                    positions = squad.Positions;
                    scores = squadScores.Single(s => s.SquadId == squad.Id).Scores;
                }
                else
                {
                    positions = position.ParentPosition.Phase!.Squads.SelectMany(s => s.Positions) ?? new List<Position>();
                    scores = phaseScores;
                }
                var score = scores[position.ParentPosition.Value - 1];
                if (score.Game > 0)
                {
                    position = positions.Single(s => s.Id == score.PositionId);
                }
            }
            return position;
        }


        public Dictionary<int, Score> InitScoreSquad(Squad squad, List<ScoreSquad> scoreSquads, Dictionary<int, List<Score>> scorePhases, User? user)
        {
            var mapPositions = squad.Positions.Where(p => p.ParentPosition != null).ToDictionary(p => p.Id, p =>
            {
                var parentPosition = FindParentPosition(p, scoreSquads, p.ParentPosition!.Phase != null ? scorePhases[p.ParentPosition!.Phase.Id] : new List<Score>());
                return parentPosition.Id;
            });
            var scores = squad.Positions.ToDictionary(p => p.Id, p => new Score() { PositionId = p.Id, TeamId = p.Team?.Id ?? 0 });
            if (mapPositions.Count == 0 || squad.Phase.Name != "Phase 2")
            {
                return scores;
            }
            var positionIds = mapPositions.Select(kv => kv.Value);
            var tourney = squad.Phase.Tourney;
            var matches = tourney.Phases.SelectMany(p => p.Squads).SelectMany(s => s.Matches.Where(m => positionIds.Contains(m.PositionA.Id) && positionIds.Contains(m.PositionB.Id))).ToList();

            Dictionary<int, Score> initScores = new Dictionary<int, Score>();
            matches.Aggregate(initScores, (acc, m) =>
            {
                var userMatch = m.UserMatches.OrderByDescending(u => u.LogTime).FirstOrDefault(u => u.User == user);
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
                if (!initScores.ContainsKey(m.PositionA.Id))
                {
                    acc.Add(m.PositionA.Id, new Score() { PositionId = m.PositionA.Id });
                }
                if (!initScores.ContainsKey(m.PositionB.Id))
                {
                    acc.Add(m.PositionB.Id, new Score() { PositionId = m.PositionB.Id });
                }
                var scoreA = acc[m.PositionA.Id];
                var scoreB = acc[m.PositionB.Id];

                _service.UpdateScore(scoreA, scoreB, null, match, m, this);
                return acc;
            });

            scores = squad.Positions.ToDictionary(p => p.Id, p =>
            {
                var id = mapPositions[p.Id];
                var score = initScores.ContainsKey(id) ? initScores[id] : new Score() { PositionId = id };
                score.PositionId = p.Id;
                return score;
            });
            return scores;
        }

        public double Total(CJoliService.ScoreType type, double total, int score)
        {
            return _service.Total(type, this, total, score);
        }


    }
}
