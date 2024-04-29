using AutoMapper;
using cjoli.Server.Dtos;
using cjoli.Server.Models;
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
            CreateMap<Match, MatchDto>()
                .ForMember(x => x.PositionA, opt => opt.MapFrom(a => a.PositionA.Value))
                .ForMember(x => x.PositionB, opt => opt.MapFrom(a => a.PositionB.Value))
                .ForMember(x => x.SquadId, opt => opt.MapFrom(a => a.Squad != null ? a.Squad.Id : 0))
                .ForMember(x => x.PhaseId, opt => opt.MapFrom(a => a.Squad != null && a.Squad.Phase != null ? a.Squad.Phase.Id : 0));

            CreateMap<Team, TeamDto>();

            CreateMap<Ranking, RankingDto>();
            CreateMap<ScoreSquad, ScoreSquad>();
            CreateMap<Score, Score>();

            CreateMap<User, UserDto>().ForMember(x => x.Password, opt => opt.Ignore());
        }
    }
}
