﻿using cjoli.Server.Datas;
using cjoli.Server.Dtos;
using cjoli.Server.Exceptions;
using cjoli.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace cjoli.Server.Services
{
    public class CJoliService
    {
        public Tourney GetTourney(string tourneyUid, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Positions).ThenInclude(p => p.Team)
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Positions).ThenInclude(p => p.ParentPosition)
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Matches)
                .Include(t => t.Teams)
                .FirstOrDefault(t => t.Uid == tourneyUid);
            if (tourney == null)
            {
                throw new NotFoundException("Tourney", tourneyUid);
            }
            return tourney;
        }

        public Ranking GetRanking(string tourneyUid, CJoliContext context)
        {
            var tourney = GetTourney(tourneyUid, context);
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
                    //var scoreSquad = new ScoreSquad() { SquadId = squad.Id, Scores = scores.Select(kv => kv.Value).OrderByDescending(x => x.Total).ToList() };
                    var listScores = scores.Select(kv => kv.Value).OrderByDescending(x => x.Total).ToList();
                    listScores.Sort((a, b) =>
                    {
                        var diff = a.Total.CompareTo(b.Total);
                        if (diff != 0)
                        {
                            return -diff;
                        }
                        var positionA = squad.Positions.Single(p => p.Id == a.PositionId);
                        var positionB = squad.Positions.Single(p => p.Id == b.PositionId);
                        //var matchs = squad.Matches.Where(m => (m.PositionA == positionA && m.PositionB == positionB) || (m.PositionB == positionA && m.PositionA == positionB)).ToList();
                        var match = squad.Matches.SingleOrDefault(m => (m.PositionA == positionA && m.PositionB == positionB) || (m.PositionB == positionA && m.PositionA == positionB));
                        if ((match != null))
                        {
                            if (match.ScoreA > match.ScoreB || match.ForfeitB)
                            {
                                return match.PositionA == positionA ? -1 : 1;
                            }
                            else if (match.ScoreB > match.ScoreA || match.ForfeitA)
                            {
                                return match.PositionB == positionA ? -1 : 1;
                            }
                        }
                        diff = a.GoalDiff.CompareTo(b.GoalDiff);
                        if (diff != 0)
                        {
                            return -diff;
                        }
                        diff = a.GoalFor.CompareTo(b.GoalFor);
                        if (diff != 0)
                        {
                            return -diff;
                        }
                        diff = a.GoalAgainst.CompareTo(b.GoalAgainst);
                        if (diff != 0)
                        {
                            return diff;
                        }
                        var teamA = positionA.Team;
                        var teamB = positionB.Team;
                        if (teamA != null && teamB != null)
                        {
                            return -teamA.Youngest?.CompareTo(teamB.Youngest) ?? 0;
                        }
                        return 0;
                    });
                    var scoreSquad = new ScoreSquad() { SquadId = squad.Id, Scores = listScores };
                    scoreSquads.Add(scoreSquad);
                }
            }
            return scoreSquads;
        }

        public void AffectationTeams(RankingDto ranking)
        {
            var positions = (ranking.Tourney.Phases ?? []).SelectMany(p => p.Squads ?? []).SelectMany(s => s.Positions ?? []);
            foreach (var position in positions.Where(p => p.ParentPosition != null))
            {
                var scoreSquad = ranking.Scores.Find(s => s.SquadId == (position.ParentPosition?.SquadId ?? 0));
                var score = (scoreSquad?.Scores ?? [])[(position.ParentPosition?.Value ?? 1) - 1];
                if (score.Game > 0)
                {
                    var positionParent = positions.Single(p => p.Id == score.PositionId);
                    position.TeamId = positionParent.TeamId;
                }
            }
        }

        public void SaveMatch(MatchDto dto, CJoliContext context)
        {
            Match? match = context.Match.SingleOrDefault(m => m.Id == dto.Id);
            if (match == null)
            {
                throw new NotFoundException("Match", dto.Id);
            }
            match.Done = true;
            if (dto.ForfeitA || dto.ForfeitB)
            {
                match.ForfeitA = dto.ForfeitA;
                match.ForfeitB = dto.ForfeitB;
                match.ScoreA = 0;
                match.ScoreB = 0;
            }
            else
            {
                match.ScoreA = dto.ScoreA;
                match.ScoreB = dto.ScoreB;
            }
            context.SaveChanges();
        }

        public void ClearMatch(MatchDto dto, CJoliContext context)
        {
            Match? match = context.Match.SingleOrDefault(m => m.Id == dto.Id);
            if (match == null)
            {
                throw new NotFoundException("Match", dto.Id);
            }
            match.Done = false;
            match.ScoreA = 0;
            match.ScoreB = 0;
            match.ForfeitA = false;
            match.ForfeitB = false;
            context.SaveChanges();
        }

        public void UpdateTeam(string uuid, TeamDto teamDto, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys.Include(t => t.Teams).SingleOrDefault(t => t.Uid == uuid);
            if (tourney == null)
            {
                throw new NotFoundException("Tourney", uuid);
            }
            Team? team = tourney.Teams.SingleOrDefault(t => t.Id == teamDto.Id);
            if (team == null)
            {
                throw new NotFoundException("Team", teamDto.Id);
            }
            team.Logo = teamDto.Logo ?? team.Logo;
            team.Youngest = teamDto.Youngest ?? team.Youngest;
            context.SaveChanges();

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
