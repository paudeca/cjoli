﻿using cjoli.Server.Dtos;
using cjoli.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace cjoli.Server.Services
{
    public class SettingService
    {
        private M Import<M, D>(D dto, CJoliContext context, Func<M?> select, Func<M> create, Action<M> update, List<Action<M>>? children = null)
        {
            M? model = select();
            if (model == null)
            {
                model = create();
            }
            update(model);
            children?.ForEach(child => child(model));
            context.SaveChanges();
            return model;
        }


        public Tourney Import(TourneyDto tourneyDto, CJoliContext context)
        {
            return Import(
                dto: tourneyDto,
                context: context,
                select: () => context.Tourneys
                    .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Positions).ThenInclude(p => p.ParentPosition)
                    .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Matches)
                    .Include(t => t.Teams)
                    .Include(t => t.Ranks)
                    .SingleOrDefault(t => t.Uid == tourneyDto.Uid),
                create: () =>
                {
                    var tourney = new Tourney() { Uid = tourneyDto.Uid ?? Guid.NewGuid().ToString(), Name = "" };
                    context.Tourneys.Add(tourney);
                    return tourney;
                },
                update: (Tourney tourney) =>
                {
                    tourney.Name = tourneyDto.Name ?? tourney.Name;
                    tourney.Season = tourneyDto.Season ?? tourney.Season;
                    tourney.Category = tourneyDto.Category ?? tourney.Category;
                    tourney.StartTime = tourneyDto.StartTime != DateTime.MinValue ? tourneyDto.StartTime : tourney.StartTime;
                    tourney.EndTime = tourneyDto.EndTime != DateTime.MinValue ? tourneyDto.EndTime : tourney.EndTime;
                    tourney.Rule = tourneyDto.Rule ?? tourney.Rule;

                },
                children: [
                    (tourney) => (tourneyDto.Teams??[]).ForEach(t => ImportTeam(t,tourney,context)),
                    (tourney) => (tourneyDto.Phases??[]).ForEach(p=>ImportPhase(p,tourney,context)),
                    (tourney)=>(tourneyDto.Ranks??[]).ForEach(r=>ImportRank(r,tourney,context))
                ]
            );
        }

        private Team ImportTeam(TeamDto teamDto, Tourney tourney, CJoliContext context)
        {
            return Import(
                dto: teamDto,
                context: context,
                select: () =>
                {
                    Func<Team, bool> filter = teamDto.Id > 0 ? (t) => t.Id == teamDto.Id : (t) => t.Name == teamDto.Name;
                    return context.Team.SingleOrDefault(filter);
                },
                create: () =>
                {
                    var team = new Team() { Name = "" };
                    context.Add(team);
                    return team;
                },
                update: (team) =>
                {
                    if (!team.Tourneys.Contains(tourney))
                    {
                        team.Tourneys.Add(tourney);
                    }
                    team.Name = teamDto.Name ?? team.Name;
                    team.Logo = teamDto.Logo ?? team.Logo;
                    team.Youngest = teamDto.Youngest ?? team.Youngest;
                    team.ShortName = teamDto.ShortName ?? team.ShortName;
                    team.FullName = teamDto.FullName ?? team.FullName;
                    team.Alias = context.Team.SingleOrDefault(t => t.Name == teamDto.Alias);
                }
            );
        }

        private Phase ImportPhase(PhaseDto phaseDto, Tourney tourney, CJoliContext context)
        {
            return Import(
                dto: phaseDto,
                context: context,
                select: () =>
                {
                    Func<Phase, bool> filter = phaseDto.Id > 0 ? (p) => p.Id == phaseDto.Id : (p) => p.Name == phaseDto.Name;
                    return tourney.Phases.SingleOrDefault(filter);
                },
                create: () =>
                {
                    var phase = new Phase() { Name = "", Tourney = tourney };
                    tourney.Phases.Add(phase);
                    return phase;
                },
                update: (phase) =>
                {
                    phase.Name = phaseDto.Name ?? phase.Name;
                },
                children: [
                    (phase)=>(phaseDto.Squads??[]).ForEach(s=>ImportSquad(s,phase,context))
                ]

            );
        }

        private Squad ImportSquad(SquadDto squadDto, Phase phase, CJoliContext context)
        {
            return Import(
                dto: squadDto,
                context: context,
                select: () =>
                {
                    Func<Squad, bool> filter = squadDto.Id > 0 ? (p) => p.Id == squadDto.Id : (p) => p.Name == squadDto.Name;
                    return phase.Squads.SingleOrDefault(filter);
                },
                create: () =>
                {
                    var squad = new Squad() { Name = "", Phase = phase };
                    phase.Squads.Add(squad);
                    return squad;
                },
                update: (squad) =>
                {
                    squad.Name = squadDto.Name ?? squad.Name;
                },
                children: [
                    (squad)=>(squadDto.Positions??[]).ForEach(p=>ImportPosition(p,squad,context)),
                    (squad)=>(squadDto.Matches??[]).ForEach(m=>ImportMatch(m,squad,context)),
                ]
            );
        }

        private Position ImportPosition(PositionDto positionDto, Squad squad, CJoliContext context)
        {
            return Import(
                dto: positionDto,
                context: context,
                select: () => squad.Positions.SingleOrDefault(p => p.Value == positionDto.Value),
                create: () =>
                {
                    var position = new Position() { Value = positionDto.Value };
                    squad.Positions.Add(position);
                    return position;
                },
                update: (position) =>
                {
                    Team? team = squad.Phase.Tourney.Teams.SingleOrDefault(t => t.Id == positionDto.TeamId);
                    position.Team = team;
                    position.Name = positionDto.Name ?? position.Name;
                    position.Short = positionDto.Short ?? position.Short;
                },
                children: [
                    (position)=>{
                        var parent = positionDto.ParentPosition;
                        if(parent==null) {
                            return;
                        }
                        var squadParent = squad.Phase.Tourney.Phases.Single(p => p.Id==parent.PhaseId || p.Name == parent.Phase).Squads.Single(s => s.Id==parent.SquadId || s.Name == parent.Squad);

                        if (position.ParentPosition == null)
                        {
                            position.ParentPosition = new ParentPosition() { Position = position, Squad = squadParent, Value = parent.Value };
                        }
                        else
                        {
                            position.ParentPosition.Value = parent.Value;
                            position.ParentPosition.Squad = squadParent;
                        }
                    }
                ]
            );
        }

        private Match ImportMatch(MatchDto matchDto, Squad squad, CJoliContext context)
        {
            return Import(
                dto: matchDto,
                context: context,
                select: () => squad.Matches.SingleOrDefault(m => m.Id == matchDto.Id),
                create: () =>
                {
                    var positionA = squad.Positions.Single(m => m.Value == matchDto.PositionA);
                    var positionB = squad.Positions.Single(m => m.Value == matchDto.PositionB);
                    var match = new Match() { PositionA = positionA, PositionB = positionB };
                    squad.Matches.Add(match);
                    return match;
                },
                update: match =>
                {
                    match.ScoreA = matchDto.ScoreA;
                    match.ScoreB = matchDto.ScoreB;
                    match.ForfeitA = matchDto.ForfeitA;
                    match.ForfeitB = matchDto.ForfeitB;
                    match.Done = matchDto.Done;
                    match.Time = matchDto.Time;
                    match.Location = matchDto.Location ?? match.Location;
                    match.Shot = matchDto.Shot;
                }
            );
        }

        private Rank ImportRank(RankDto rankDto, Tourney tourney, CJoliContext context)
        {
            return Import(
                dto: rankDto,
                context: context,
                select: () => tourney.Ranks.SingleOrDefault(r => r.Order == rankDto.Order),
                create: () =>
                {
                    Squad squad = tourney.Phases.Single(s => rankDto.PhaseId > 0 ? s.Id == rankDto.PhaseId : s.Name == rankDto.Phase).Squads.Single(s => rankDto.SquadId > 0 ? s.Id == rankDto.SquadId : s.Name == rankDto.Squad);
                    var rank = new Rank() { Tourney = tourney, Squad = squad, Order = rankDto.Order };
                    tourney.Ranks.Add(rank);
                    return rank;
                },
                update: (rank) =>
                {
                    Squad squad = tourney.Phases.Single(s => rankDto.PhaseId > 0 ? s.Id == rankDto.PhaseId : s.Name == rankDto.Phase).Squads.Single(s => rankDto.SquadId > 0 ? s.Id == rankDto.SquadId : s.Name == rankDto.Squad);
                    rank.Squad = squad;
                    rank.Value = rankDto.Value;
                    rank.Name = rankDto.Name ?? rank.Name;
                }
            );
        }
        private Tourney GetTourney(string uid, CJoliContext context)
        {
            return context.Tourneys.
                Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Positions)
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Matches)
                .Include(t => t.Teams)
                .Include(t => t.Ranks.OrderBy(r => r.Order))
                .Single(t => t.Uid == uid);
        }

        public void RemoveTourney(string uid, CJoliContext context)
        {
            Tourney tourney = GetTourney(uid, context);
            context.Tourneys.Remove(tourney);
            context.SaveChanges();
        }


        public Tourney RemoveTeam(string uid, int teamId, CJoliContext context)
        {
            Tourney tourney = GetTourney(uid, context);
            Team team = tourney.Teams.Single(t => t.Id == teamId);
            tourney.Phases.SelectMany(p => p.Squads).SelectMany(s => s.Positions).Where(p => p.Team == team).ToList().ForEach(p => p.Team = null);
            tourney.Teams.Remove(team);
            context.SaveChanges();
            return tourney;
        }

        public Tourney RemovePhase(string uid, int phaseId, CJoliContext context)
        {
            Tourney tourney = GetTourney(uid, context);
            Phase phase = tourney.Phases.Single(p => p.Id == phaseId);
            context.Remove(phase);
            context.SaveChanges();
            return tourney;
        }
        public Tourney RemoveSquad(string uid, int phaseId, int squadId, CJoliContext context)
        {
            Tourney tourney = GetTourney(uid, context);
            Squad squad = tourney.Phases.Single(p => p.Id == phaseId).Squads.Single(s => s.Id == squadId);
            context.Remove(squad);
            context.SaveChanges();
            return tourney;
        }
        public Tourney RemovePosition(string uid, int phaseId, int squadId, int positionId, CJoliContext context)
        {
            Tourney tourney = GetTourney(uid, context);
            Position position = tourney.Phases.Single(p => p.Id == phaseId).Squads.Single(s => s.Id == squadId).Positions.Single(p => p.Id == positionId);
            context.Remove(position);
            context.SaveChanges();
            return tourney;
        }
        public Tourney RemoveMatch(string uid, int phaseId, int squadId, int matchId, CJoliContext context)
        {
            Tourney tourney = GetTourney(uid, context);
            Match match = tourney.Phases.Single(p => p.Id == phaseId).Squads.Single(s => s.Id == squadId).Matches.Single(p => p.Id == matchId);
            context.Remove(match);
            context.SaveChanges();
            return tourney;
        }
        public Tourney RemoveRank(string uid, int rankId, CJoliContext context)
        {
            Tourney tourney = GetTourney(uid, context);
            Rank rank = tourney.Ranks.Single(r => r.Id == rankId);
            tourney.Ranks.Remove(rank);
            context.Remove(rank);
            for (int i = 0; i < tourney.Ranks.Count; i++)
            {
                tourney.Ranks[i].Order = i + 1;
            }
            context.SaveChanges();
            return tourney;
        }



    }
}