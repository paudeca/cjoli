﻿using AutoMapper;
using cjoli.Server.Dtos;
using cjoli.Server.Models;
using cjoli.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

        private string? GetLogin()
        {
            if (User.Identity == null || !this.User.Identity.IsAuthenticated)
            {
                return null;
            }
            return User.Claims.First(i => i.Type == ClaimTypes.NameIdentifier).Value;
        }


        [HttpGet]
        [Route("Tourneys")]
        public List<TourneyDto> ListTourneys()
        {
            return _service.ListTourneys(_context).Select(t => _mapper.Map<TourneyDto>(t)).ToList();
        }


        [HttpGet]
        [Route("{uuid}/Ranking")]
        public RankingDto GetRanking(string uuid)
        {
            string? login = GetLogin();
            var ranking = _mapper.Map<RankingDto>(_service.GetRanking(uuid, login, _context));
            _service.SetConfig(ranking);
            _service.AffectationTeams(ranking);
            _service.CalculateHistory(ranking);
            return ranking;
        }


        [HttpGet]
        [Route("{uuid}/Export")]
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
        [Authorize]
        [Route("{uuid}/SaveMatch")]
        public RankingDto SaveMatch([FromRoute] string uuid, [FromBody] MatchDto match)
        {
            var login = GetLogin();
            _service.SaveMatch(match, login!, uuid, _context);
            return GetRanking(uuid);
        }

        [HttpPost]
        [Authorize]
        [Route("{uuid}/ClearMatch")]
        public RankingDto ClearMatch([FromRoute] string uuid, [FromBody] MatchDto match)
        {
            var login = GetLogin();
            _service.ClearMatch(match, login!, uuid, _context);
            return GetRanking(uuid);
        }

        [HttpPost]
        [Authorize]
        [Route("{uuid}/ClearSimulations")]
        public RankingDto ClearSimulations([FromRoute] string uuid, [FromBody] int[] ids)
        {
            var login = GetLogin();
            _service.ClearSimulations(ids, login!, uuid, _context);
            return GetRanking(uuid);
        }


        [HttpPost]
        [Authorize]
        [Route("{uuid}/UpdateTeam")]
        public RankingDto UpdateTeam([FromRoute] string uuid, [FromBody] TeamDto teamDto)
        {
            var login = GetLogin();
            _service.UpdateTeam(uuid, teamDto, _context);
            return GetRanking(uuid);
        }

        [HttpPost]
        [Authorize]
        [Route("{uuid}/UpdatePosition")]
        public RankingDto UpdatePosition([FromRoute] string uuid, [FromBody] PositionDto positionDto)
        {
            var login = GetLogin();
            _service.UpdatePosition(uuid, positionDto, _context);
            return GetRanking(uuid);
        }


        [HttpGet]
        [Authorize]
        [Route("{uuid}/UpdateEstimate")]
        public RankingDto UpdateEstimate(string uuid)
        {
            var login = GetLogin();
            _service.UpdateEstimate(uuid, login!, _context);
            return GetRanking(uuid);
        }

        [HttpPost]
        [Authorize]
        [Route("{uuid}/SaveUserConfig")]
        public RankingDto SaveUserConfig(string uuid, UserConfigDto config)
        {
            var login = GetLogin();
            _service.SaveUserConfig(uuid, login, config, _context);
            return GetRanking(uuid);
        }


    }
}
