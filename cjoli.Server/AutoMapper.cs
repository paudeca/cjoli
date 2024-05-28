﻿using AutoMapper;
using cjoli.Server.Dtos;
using cjoli.Server.Models;
using cjoli.Server.Models.AI;
using cjoli.Server.Services;

namespace cjoli.Server
{
    public class AutoMapper : Profile
    {
        public AutoMapper()
        {
            CreateMap<Tourney, TourneyDto>();
            CreateMap<Phase, PhaseDto>();
            CreateMap<Squad, SquadDto>();
            CreateMap<Position, PositionDto>()
                .ForMember(x => x.TeamId, opt => opt.MapFrom(a => a.Team != null ? a.Team.Id : 0))
                .ForMember(x => x.SquadId, opt => opt.MapFrom(a => a.Squad != null ? a.Squad.Id : 0));

            CreateMap<ParentPosition, ParentPositionDto>()
                .ForMember(x => x.SquadId, opt => opt.MapFrom(a => a.Squad.Id))
                .ForMember(x => x.Squad, opt => opt.MapFrom(a => a.Squad.Name))
                .ForMember(x => x.Phase, opt => opt.MapFrom(a => a.Squad.Phase.Name));

            CreateMap<Match, MatchDto>()
                .ForMember(x => x.PositionA, opt => opt.MapFrom(a => a.PositionA.Value))
                .ForMember(x => x.PositionIdA, opt => opt.MapFrom(a => a.PositionA.Id))
                .ForMember(x => x.PositionB, opt => opt.MapFrom(a => a.PositionB.Value))
                .ForMember(x => x.PositionIdB, opt => opt.MapFrom(a => a.PositionB.Id))
                .ForMember(x => x.SquadId, opt => opt.MapFrom(a => a.Squad != null ? a.Squad.Id : 0))
                .ForMember(x => x.PhaseId, opt => opt.MapFrom(a => a.Squad != null && a.Squad.Phase != null ? a.Squad.Phase.Id : 0))
                .ForMember(x => x.UserMatch, opt => opt.MapFrom(u => u.UserMatches.SingleOrDefault()))
                .ForMember(x => x.Estimate, opt => opt.MapFrom(a => a.Estimates.OrderByDescending(s => s.User).FirstOrDefault()));
            CreateMap<UserMatch, UserMatchDto>().ForMember(x => x.Time, opt => opt.MapFrom(u => u.Match.Time));
            CreateMap<MatchEstimate, MatchEstimateDto>();

            CreateMap<Team, TeamDto>()
                .ForMember(x => x.Datas, opt => opt.MapFrom(t => t.TeamDatas.SingleOrDefault()))
                .ForMember(x => x.Alias, opt => opt.MapFrom(t => t.Alias != null ? t.Alias.Name : null))
                .ForMember(x => x.Logo, opt => opt.MapFrom(t => t.Logo == null && t.Alias != null ? t.Alias.Logo : t.Logo));
            CreateMap<TeamData, TeamDataDto>();

            CreateMap<Ranking, RankingDto>();

            CreateMap<Rank, RankDto>()
                .ForMember(x => x.PhaseId, opt => opt.MapFrom(r => r.Squad.Phase.Id))
                .ForMember(x => x.SquadId, opt => opt.MapFrom(r => r.Squad.Id))
                .ForMember(x => x.Phase, opt => opt.MapFrom(r => r.Squad.Phase.Name))
                .ForMember(x => x.Squad, opt => opt.MapFrom(r => r.Squad.Name));

            CreateMap<Scores, Scores>();
            CreateMap<ScoreSquad, ScoreSquad>();
            CreateMap<Score, Score>();

            CreateMap<User, UserDto>().ForMember(x => x.Password, opt => opt.Ignore());
            CreateMap<UserConfig, UserConfigDto>().ForMember(x => x.TourneyId, opt => opt.MapFrom(u => u.Tourney.Id));

            CreateMap<TourneyDto, TourneyAI>();
            CreateMap<PhaseDto, PhaseAI>();
            CreateMap<SquadDto, SquadAI>().ForMember(x => x.Matches, opt => opt.MapFrom(s => s.Matches!.Where(m => m.Done)));
            CreateMap<MatchDto, MatchAI>();
            CreateMap<PositionDto, PositionAI>();
            CreateMap<TeamDto, TeamAI>();
            CreateMap<RankDto, RankAI>();
        }
    }
}
