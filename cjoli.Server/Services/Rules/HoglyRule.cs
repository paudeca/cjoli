

using cjoli.Server.Dtos;
using cjoli.Server.Extensions;
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

        public double GoalFor => 0;


        public bool HasPenalty => false;
        public bool HasForfeit => true;
        public bool HasYoungest => false;


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

        public Dictionary<int, Score> InitScoreSquad(Squad squad, List<ScoreSquad> scoreSquads, User? user)
        {
            var mapPositions = squad.Positions.Where(p => p.ParentPosition != null && scoreSquads.SingleOrDefault(s => s.SquadId == p.ParentPosition!.Squad.Id)!=null).ToDictionary(p => p.Id, p =>
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
            var matches = tourney.Phases.SelectMany(p => p.Squads).SelectMany(s => s.Matches.Where(m => positionIds.Contains(m.PositionA.Id) || positionIds.Contains(m.PositionB.Id))).ToList();
            //var matches = tourney.Phases.SelectMany(p => p.Squads).SelectMany(s => s.Matches).ToList();

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
                if (match == null || !initScores.ContainsKey(m.PositionA.Id) || !initScores.ContainsKey(m.PositionB.Id))
                {
                    return acc;
                }
                var scoreA = initScores[m.PositionA.Id];
                var scoreB = initScores[m.PositionB.Id];

                _service.UpdateScore(scoreA, scoreB, null, match, m, this);
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

        public double Total(CJoliService.ScoreType type, double total, int score)
        {
            return _service.Total(type, this, total, score);
        }

    }
}
