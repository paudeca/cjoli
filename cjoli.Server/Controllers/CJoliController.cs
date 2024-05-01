using AutoMapper;
using cjoli.Server.Datas;
using cjoli.Server.Dtos;
using cjoli.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace cjoli.Server.Controllers
{

    [ApiController]
    [Route("[controller]")]
    public class CJoliController : ControllerBase
    {
        private readonly CJoliService _service;
        private readonly IMapper _mapper;
        private readonly CJoliContext _context;

        public CJoliController(CJoliService service, IMapper mapper, CJoliContext context)
        {
            _service = service;
            _mapper = mapper;
            _context = context;
        }

        [HttpGet]
        [Route("Ranking/{uuid}")]
        public RankingDto GetRanking(string uuid)
        {
            var ranking = _mapper.Map<RankingDto>(_service.GetRanking(uuid, _context));
            _service.AffectationTeams(ranking);
            return ranking;
        }

        [HttpGet]
        [Route("Export/{uuid}")]
        public TourneyDto Export(string uuid)
        {
            return _mapper.Map<TourneyDto>(_service.GetTourney(uuid, _context));
        }

        [HttpPost]
        [Route("Import")]
        public string Import(TourneyDto tourneyDto)
        {
            var tourney = _service.Import(tourneyDto, _context);
            return tourney.Uid;
        }

    }
}
