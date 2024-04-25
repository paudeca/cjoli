using AutoMapper;
using cjoli.Server.Dtos;
using cjoli.Server.Models;

namespace cjoli.Server
{
    public class AutoMapper : Profile
    {
        public AutoMapper()
        {
            CreateMap<Tourney, TourneyDto>();
            CreateMap<Phase, PhaseDto>();
            CreateMap<Squad, SquadDto>();
            CreateMap<Position, PositionDto>().ForMember(x => x.TeamId, opt => opt.MapFrom(a => a.Team != null ? a.Team.Id : 0));
            CreateMap<Match, MatchDto>()
                .ForMember(x => x.PositionA, opt => opt.MapFrom(a => a.PositionA.Id))
                .ForMember(x => x.PositionB, opt => opt.MapFrom(a => a.PositionB.Id));
            CreateMap<Team, TeamDto>();
        }
    }
}
