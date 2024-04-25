using cjoli.Server.Datas;
using cjoli.Server.Exceptions;
using cjoli.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace cjoli.Server.Services
{
    public class CJoliService
    {

        public Ranking GetRanking(string tourneyUid, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Positions).ThenInclude(p => p.Team)
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Matches)
                .Include(t => t.Teams)
                .FirstOrDefault(t => t.Uid == tourneyUid);
            if (tourney == null)
            {
                throw new NotFoundException("Tourney", tourneyUid);
            }
            var scores = CalculateScores(tourney);
            return new Ranking() { Tourney = tourney, Scores = scores };
        }

        private List<ScoreSquad> CalculateScores(Tourney tourney)
        {
            var scoreSquads = new List<ScoreSquad>();
            foreach (var phase in tourney.Phases)
            {
                foreach (var squad in phase.Squads)
                {

                    Dictionary<int, Score> scores = squad.Positions.ToDictionary(p => p.Id, p => new Score() { PositionId = p.Id });
                    squad.Matches.Where(m => m.Done).Aggregate(scores, (acc, m) =>
                    {
                        var scoreA = scores[m.PositionA.Id];
                        var scoreB = scores[m.PositionB.Id];
                        scoreA.Game++;
                        scoreB.Game++;

                        if (m.ScoreA > m.ScoreB || m.ForfeitB)
                        {
                            scoreA.Win++;
                            scoreB.Loss++;

                            scoreA.Total += 3;
                            scoreB.Total += m.ForfeitB ? 0 : 1;
                        }
                        else if (m.ScoreA < m.ScoreB || m.ForfeitA)
                        {
                            scoreA.Loss++;
                            scoreB.Win++;

                            scoreA.Total += m.ForfeitA ? 0 : 1;
                            scoreB.Total += 3;
                        }
                        else
                        {
                            scoreA.Neutral++;
                            scoreB.Neutral++;

                            scoreA.Total += 2;
                            scoreB.Total += 2;
                        }
                        scoreA.GoalFor += m.ScoreA;
                        scoreA.GoalAgainst += m.ScoreB;
                        scoreA.GoalDiff += m.ScoreA - m.ScoreB;

                        scoreB.GoalFor += m.ScoreB;
                        scoreB.GoalAgainst += m.ScoreA;
                        scoreB.GoalDiff += m.ScoreB - m.ScoreA;


                        return scores;
                    });
                    var scoreSquad = new ScoreSquad() { SquadId = squad.Id, Scores = scores.Select(kv => kv.Value).ToList() };
                    scoreSquads.Add(scoreSquad);
                }
            }
            return scoreSquads;
        }

    }

    public class Ranking
    {
        public required Tourney Tourney { get; set; }
        public required List<ScoreSquad> Scores { get; set; }
    }

    public class ScoreSquad
    {
        public int SquadId { get; set; }
        public List<Score>? Scores { get; set; }

    }

    public class Score
    {
        public int PositionId { get; set; }
        public int Game { get; set; }
        public int Win { get; set; }
        public int Neutral { get; set; }
        public int Loss { get; set; }
        public int Total { get; set; }
        public int GoalFor { get; set; }
        public int GoalAgainst { get; set; }
        public int GoalDiff { get; set; }
    }
}
