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
        private readonly ImportService _importService;
        private readonly IMapper _mapper;
        private readonly CJoliContext _context;

        public CJoliController(CJoliService service, ImportService importService, IMapper mapper, CJoliContext context)
        {
            _service = service;
            _importService = importService;
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
            var tourney = _importService.Import(tourneyDto, _context);
            return tourney.Uid;
        }

        [HttpPost]
        //[Authorize]
        [Route("SaveMatch/{uuid}")]
        public RankingDto SaveMatch([FromRoute] string uuid, [FromBody] MatchDto match)
        {
            _service.SaveMatch(match, _context);
            return GetRanking(uuid);
        }

        [HttpPost]
        //[Authorize]
        [Route("ClearMatch/{uuid}")]
        public RankingDto ClearMatch([FromRoute] string uuid, [FromBody] MatchDto match)
        {
            _service.ClearMatch(match, _context);
            return GetRanking(uuid);
        }


        [HttpPost]
        [Route("UpdateTeam/{uuid}")]
        public bool UpdateTeam([FromRoute] string uuid, [FromBody] TeamDto teamDto)
        {
            _service.UpdateTeam(uuid, teamDto, _context);
            return true;
        }

    }
}
