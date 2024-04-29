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
                    var scoreSquad = new ScoreSquad() { SquadId = squad.Id, Scores = scores.Select(kv => kv.Value).ToList() };
                    scoreSquads.Add(scoreSquad);
                }
            }
            return scoreSquads;
        }

        public Tourney Import(TourneyDto tourneyDto, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Positions)
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Matches)
                .Include(t => t.Teams)
                .SingleOrDefault(t => t.Uid == tourneyDto.Uid);
            if (tourney == null)
            {
                tourney = new Tourney() { Uid = Guid.NewGuid().ToString(), Name = "" };
                context.Tourneys.Add(tourney);
            }
            tourney.Name = tourneyDto.Name ?? tourney.Name;

            if (tourneyDto.Teams != null)
            {
                foreach (var teamDto in tourneyDto.Teams)
                {
                    var team = ImportTeam(teamDto, tourney, context);
                }
            }
            if (tourneyDto.Phases != null)
            {
                foreach (var phaseDto in tourneyDto.Phases)
                {
                    var phase = ImportPhase(phaseDto, tourney, context);
                }
            }

            context.SaveChanges();
            return tourney;
        }

        private Team ImportTeam(TeamDto teamDto, Tourney tourney, CJoliContext context)
        {
            Team? team = tourney.Teams.SingleOrDefault(t => t.Id == teamDto.Id);
            if (team == null)
            {
                team = new Team() { Name = "" };
                tourney.Teams.Add(team);
            }
            team.Name = teamDto.Name ?? team.Name;
            context.SaveChanges();
            return team;
        }

        private Phase ImportPhase(PhaseDto phaseDto, Tourney tourney, CJoliContext context)
        {
            Phase? phase = tourney.Phases.SingleOrDefault(p => p.Id == phaseDto.Id);
            if (phase == null)
            {
                phase = new Phase() { Name = "" };
                tourney.Phases.Add(phase);
            }
            phase.Name = phaseDto.Name ?? phase.Name;

            if (phaseDto.Squads != null)
            {
                foreach (var squadsDto in phaseDto.Squads)
                {
                    var squad = ImportSquad(squadsDto, phase, tourney, context);
                }
            }
            context.SaveChanges();
            return phase;
        }

        private Squad ImportSquad(SquadDto squadDto, Phase phase, Tourney tourney, CJoliContext context)
        {
            Squad? squad = phase.Squads.SingleOrDefault(s => s.Id == squadDto.Id);
            if (squad == null)
            {
                squad = new Squad() { Name = "" };
                phase.Squads.Add(squad);
            }
            squad.Name = squadDto.Name ?? squad.Name;

            if (squadDto.Positions != null)
            {
                foreach (var positionDto in squadDto.Positions)
                {
                    ImportPosition(positionDto, squad, tourney, context);
                }
            }
            if (squadDto.Matches != null)
            {
                foreach (var matchDto in squadDto.Matches)
                {
                    ImportMatch(matchDto, squad, context);
                }
            }
            context.SaveChanges();
            return squad;
        }

        private Position ImportPosition(PositionDto positionDto, Squad squad, Tourney tourney, CJoliContext context)
        {
            Position? position = squad.Positions.SingleOrDefault(p => p.Value == positionDto.Value);
            if (position == null)
            {
                position = new Position() { Value = positionDto.Value };
                squad.Positions.Add(position);
            }
            Team? team = tourney.Teams.SingleOrDefault(t => t.Id == positionDto.TeamId);
            position.Team = team;
            context.SaveChanges();
            return position;
        }

        private Match ImportMatch(MatchDto matchDto, Squad squad, CJoliContext context)
        {
            Match? match = squad.Matches.SingleOrDefault(m => m.PositionA.Value == matchDto.PositionA && m.PositionB.Value == matchDto.PositionB);
            if (match == null)
            {
                var positionA = squad.Positions.Single(m => m.Value == matchDto.PositionA);
                var positionB = squad.Positions.Single(m => m.Value == matchDto.PositionB);
                match = new Match() { PositionA = positionA, PositionB = positionB };
                squad.Matches.Add(match);
            }
            match.ScoreA = matchDto.ScoreA;
            match.ScoreB = matchDto.ScoreB;
            match.ForfeitA = matchDto.ForfeitA;
            match.ForfeitB = matchDto.ForfeitB;
            match.Done = matchDto.Done;
            match.Time = matchDto.Time;
            context.SaveChanges();
            return match;
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
