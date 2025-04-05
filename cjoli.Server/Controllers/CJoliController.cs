﻿using AutoMapper;
using cjoli.Server.Dtos;
using cjoli.Server.Extensions;
using cjoli.Server.Models;
using cjoli.Server.Services;
using Google.Apis.Auth;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Context;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace cjoli.Server.Controllers
{

    [ApiController]
    [Route("[controller]")]
    public class CJoliController : ControllerBase
    {
        private readonly CJoliService _service;
        private readonly SettingService _settingService;
        private readonly AIService _aiService;
        private readonly MessageService _messageService;
        private readonly IMapper _mapper;
        private readonly CJoliContext _context;
        private readonly ILogger<CJoliController> _logger;


        public CJoliController(
            CJoliService service,
            SettingService settingService,
            AIService aiService,
            MessageService messageService,
            IMapper mapper,
            CJoliContext context,
            ILogger<CJoliController> logger)
        {
            _service = service;
            _settingService = settingService;
            _aiService = aiService;
            _messageService = messageService;
            _mapper = mapper;
            _context = context;
            _logger = logger;
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
            return _service.ListTourneys(_context).Select(_mapper.Map<TourneyDto>).ToList();
        }

        [HttpGet]
        [Route("Teams")]
        public List<TeamDto> ListTeams()
        {
            return _service.ListTeams(_context).Select(_mapper.Map<TeamDto>).ToList();
        }


        [HttpGet]
        [Route("{uuid}/Ranking")]
        public RankingDto GetRanking(string uuid)
        {
            string? login = GetLogin();
            return _service.CreateRanking(uuid, login, _context);
        }

        [HttpGet]
        [Route("{uuid}/Gallery/{page}")]
        public GalleryDto GetGallery(string uuid,int page,[FromQuery] bool waiting, [FromQuery] bool random)
        {
            string? login = GetLogin();
            return _service.CreateGallery(uuid, page, login, waiting, random, _context);
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
            var tourney = _settingService.Import(tourneyDto, _context);
            return tourney.Uid;
        }

        [HttpPost]
        [Authorize]
        [Route("{uuid}/SaveMatch")]
        public RankingDto SaveMatch([FromRoute] string uuid, [FromBody] MatchDto match)
        {
            using (LogContext.PushProperty("uid", uuid))
            {
                var login = GetLogin();
                _service.SaveMatch(match, login!, uuid, _context);
                _logger.LogInformationWithData("SaveMatch", match);
                return GetRanking(uuid);
            }
        }

        [HttpPost]
        [Authorize]
        [Route("{uuid}/UpdateMatch")]
        public RankingDto UpdateMatch([FromRoute] string uuid, [FromBody] MatchDto match)
        {
            using (LogContext.PushProperty("uid", uuid))
            {
                var login = GetLogin();
                _service.UpdateMatch(match, login!, uuid, _context);
                _logger.LogInformationWithData("SaveMatch", match);
                return GetRanking(uuid);
            }
        }


        [HttpPost]
        [Authorize]
        [Route("{uuid}/ClearMatch")]
        public RankingDto ClearMatch([FromRoute] string uuid, [FromBody] MatchDto match)
        {
            using (LogContext.PushProperty("uid", uuid))
            {
                var login = GetLogin();
                _service.ClearMatch(match, login!, uuid, _context);
                _logger.LogInformationWithData("ClearMatch", match);
                return GetRanking(uuid);
            }
        }

        [HttpPost]
        [Authorize]
        [Route("{uuid}/ClearSimulations")]
        public RankingDto ClearSimulations([FromRoute] string uuid, [FromBody] int[] ids)
        {
            using (LogContext.PushProperty("uid", uuid))
            {
                var login = GetLogin();
                _service.ClearSimulations(ids, login!, uuid, _context);
                _logger.LogInformationWithData("ClearSimulation", ids);
                return GetRanking(uuid);
            }
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


        [HttpPost]
        [Authorize]
        [Route("{uuid}/SaveUserConfig")]
        public RankingDto SaveUserConfig(string uuid, UserConfigDto config)
        {
            var login = GetLogin();
            _service.SaveUserConfig(uuid, login, config, _context);
            return GetRanking(uuid);
        }

        [HttpGet]
        [Route("{uuid}/Prompt")]
        public async Task<string?> Prompt(string uuid, [FromQuery] string lang)
        {
            var login = GetLogin();
            var dto = _service.CreateRanking(uuid, login, _context);
            return await _aiService.Prompt(uuid, lang, login, dto, _context);
        }

        [HttpPost]
        [Authorize("IsAdmin")]
        [Route("{uuid}/UpdateEvent")]
        public RankingDto UpdatEvent([FromRoute] string uuid, [FromBody] EventDto dto)
        {
            using (LogContext.PushProperty("uid", uuid))
            {
                var login = GetLogin();
                _service.UpdateEvent(uuid, login, dto, _context);
                return GetRanking(uuid);
            }
        }

        [HttpPost]
        [Route("{uuid}/Upload")]
        public async Task<IActionResult> OnPostUploadAsync([FromRoute] string uuid,List<IFormFile> files)
        {
            long size = files.Sum(f => f.Length);

            foreach (var formFile in files)
            {
                if (formFile.Length > 0)
                {
                    var filePath = Path.GetTempFileName();

                    using (var stream = System.IO.File.Create(filePath))
                    {
                        await formFile.CopyToAsync(stream);
                        stream.Position = 0;

                        await _messageService.UploadImage(stream, "image/png", uuid, _context);
                    }
                }
            }

            return Ok(new { count = files.Count, size });
        }

    }
}
