using AutoMapper;
using cjoli.Server.Dtos;
using cjoli.Server.Models;

namespace cjoli.Server
{
    public class AutoMapper : Profile
    {
        public AutoMapper()
        {
            //CreateMap<TourneyDto, Tourney>().ForMember(x => x.Teams, opt => opt.Ignore()).ForMember(x => x.Matches, opt => opt.Ignore());
            CreateMap<Tourney, TourneyDto>();
        }
    }
}
