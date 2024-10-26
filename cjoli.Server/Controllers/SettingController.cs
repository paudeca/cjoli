using AutoMapper;
using cjoli.Server.Dtos;
using cjoli.Server.Models;
using cjoli.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cjoli.Server.Controllers
{

    [ApiController]
    [Authorize]
    [Route("[controller]")]
    public class SettingController : ControllerBase
    {
        private readonly CJoliService _service;
        private readonly ImportService _importService;
        private readonly IMapper _mapper;
        private readonly CJoliContext _context;

        public SettingController(CJoliService service, ImportService importService, IMapper mapper, CJoliContext context)
        {
            _service = service;
            _importService = importService;
            _mapper = mapper;
            _context = context;
        }


        [HttpGet]
        [Route("Teams")]
        public List<TeamDto> ListTeams()
        {
            return _service.ListTeams(_context).Select(_mapper.Map<TeamDto>).ToList();
        }

        [HttpPost]
        [Route("Tourney")]
        public TourneyDto Update(TourneyDto tourney)
        {
            return _mapper.Map<TourneyDto>(_importService.Import(tourney, _context));
        }

        [HttpDelete]
        [Route("Tourney/{uid}")]
        public void RemoveTourney(string uid)
        {
            _importService.RemoveTourney(uid, _context);
        }


        [HttpDelete]
        [Route("Tourney/{uid}/teams/{teamId}")]
        public TourneyDto RemoveTeam(string uid, int teamId)
        {
            return _mapper.Map<TourneyDto>(_importService.RemoveTeam(uid, teamId, _context));
        }

        [HttpDelete]
        [Route("Tourney/{uid}/phases/{phaseId}")]
        public TourneyDto RemovePhase(string uid, int phaseId)
        {
            return _mapper.Map<TourneyDto>(_importService.RemovePhase(uid, phaseId, _context));
        }

        [HttpDelete]
        [Route("Tourney/{uid}/phases/{phaseId}/squads/{squadId}")]
        public TourneyDto RemoveSquad(string uid, int phaseId, int squadId)
        {
            return _mapper.Map<TourneyDto>(_importService.RemoveSquad(uid, phaseId, squadId, _context));
        }

        [HttpDelete]
        [Route("Tourney/{uid}/phases/{phaseId}/squads/{squadId}/positions/{positionId}")]
        public TourneyDto RemovePosition(string uid, int phaseId, int squadId, int positionId)
        {
            return _mapper.Map<TourneyDto>(_importService.RemovePosition(uid, phaseId, squadId, positionId, _context));
        }

        [HttpDelete]
        [Route("Tourney/{uid}/phases/{phaseId}/squads/{squadId}/matches/{matchId}")]
        public TourneyDto RemoveMatch(string uid, int phaseId, int squadId, int matchId)
        {
            return _mapper.Map<TourneyDto>(_importService.RemoveMatch(uid, phaseId, squadId, matchId, _context));
        }

        [HttpDelete]
        [Route("Tourney/{uid}/ranks/{rankId}")]
        public TourneyDto RemoveRank(string uid, int rankId)
        {
            return _mapper.Map<TourneyDto>(_importService.RemoveRank(uid, rankId, _context));
        }

    }
}
