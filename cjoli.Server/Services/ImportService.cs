using cjoli.Server.Datas;
using cjoli.Server.Dtos;
using cjoli.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace cjoli.Server.Services
{
    public class ImportService
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
                    .SingleOrDefault(t => t.Uid == tourneyDto.Uid),
                create: () =>
                {
                    var tourney = new Tourney() { Uid = Guid.NewGuid().ToString(), Name = "" };
                    context.Tourneys.Add(tourney);
                    return tourney;
                },
                update: (Tourney tourney) =>
                {
                    tourney.Name = tourneyDto.Name ?? tourney.Name;
                },
                children: [
                    (tourney) => (tourneyDto.Teams??[]).ForEach(t => ImportTeam(t,tourney,context)),
                    (tourney) => (tourneyDto.Phases??[]).ForEach(p=>ImportPhase(p,tourney,context))
                ]
            );
        }

        private Team ImportTeam(TeamDto teamDto, Tourney tourney, CJoliContext context)
        {
            return Import(
                dto: teamDto,
                context: context,
                select: () => tourney.Teams.SingleOrDefault(t => t.Id == teamDto.Id),
                create: () =>
                {
                    var team = new Team() { Name = "" };
                    tourney.Teams.Add(team);
                    return team;
                },
                update: (team) =>
                {
                    team.Name = teamDto.Name ?? team.Name;
                    team.Logo = teamDto.Logo ?? team.Logo;
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
                },
                children: [
                    (position)=>{
                        var parent = positionDto.ParentPosition;
                        if(parent==null) {
                            return;
                        }
                        var squadParent = squad.Phase.Tourney.Phases.Single(p => p.Name == parent.Phase).Squads.Single(s => s.Name == parent.Squad);

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
                select: () => squad.Matches.SingleOrDefault(m => m.PositionA.Value == matchDto.PositionA && m.PositionB.Value == matchDto.PositionB),
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
                }
            );
        }

    }
}
