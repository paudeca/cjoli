

using cjoli.Server.Models;
using cjoli.Server.Models.AI;
using System.Text.RegularExpressions;

namespace cjoli.Server.Services.Rules
{
    public class LyonRule : IRule
    {
        private readonly CJoliService _service;
        public LyonRule(CJoliService service)
        {
            _service = service;
        }

        public int Win => 3;

        public int Neutral => 1;

        public int Loss => 0;

        public int Forfeit => 0;

        public bool HasPenalty => false;
        public bool HasForfeit => false;

        public Func<Squad, Comparison<Score>> ScoreComparison => (Squad squad) => (Score a, Score b) =>
        {
            var diff = a.Total.CompareTo(b.Total);
            if (diff != 0)
            {
                return -diff;
            }
            diff = a.Win.CompareTo(b.Win);
            if (diff != 0)
            {
                return -diff;
            }

            var positionA = squad.Positions.Single(p => p.Id == a.PositionId);
            var positionB = squad.Positions.Single(p => p.Id == b.PositionId);
            var matches = squad.Matches.Where(m => (m.PositionA == positionA && m.PositionB == positionB) || (m.PositionB == positionA && m.PositionA == positionB)).OrderBy(m=>m.Time).ToList();

            int goalFor = 0;
            int goalAgainst = 0;
            int goalDiff = 0;
            if (matches.Count>0)
            {
                diff = 0;
                foreach(var match in matches)
                {
                    var userMatch = match.UserMatches.SingleOrDefault();
                    IMatch m = match.Done ? match : userMatch != null ? userMatch : match;
                    if (m.ScoreA > m.ScoreB || m.ForfeitB)
                    {
                        goalFor += match.PositionA == positionA ? m.ScoreA : -m.ScoreA;
                        goalAgainst += match.PositionA == positionA ? m.ScoreB : -m.ScoreB;
                        goalDiff += match.PositionA == positionA ? m.ScoreA-m.ScoreB : m.ScoreB-m.ScoreA;
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
                    return diff;
                }
            }
            diff = a.GoalFor.CompareTo(b.GoalFor);
            if (diff != 0)
            {
                return -diff;
            }

            if(goalFor!=0)
            {
                return -goalFor;
            }

            diff = a.GoalAgainst.CompareTo(b.GoalAgainst);
            if (diff != 0)
            {
                return diff;
            }

            if (goalAgainst != 0)
            {
                return goalAgainst;
            }

            diff = a.GoalDiff.CompareTo(b.GoalDiff);
            if (diff != 0)
            {
                return -diff;
            }

            if (goalDiff != 0)
            {
                return -goalDiff;
            }



            return 0;
        };


        public Dictionary<int, Score> InitScoreSquad(Squad squad, List<ScoreSquad> scoreSquads)
        {
            return squad.Positions.ToDictionary(p => p.Id, p => new Score() { PositionId = p.Id, TeamId = p.Team?.Id ?? 0 });
        }
    }
}
