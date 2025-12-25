using AutoMapper;
using cjoli.Server.Dtos;
using cjoli.Server.Extensions;
using cjoli.Server.Models;
using cjoli.Server.Services;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Serilog.Context;
using System.Security.Claims;

namespace cjoli.Server.Controllers
{

    [FirestoreData]
    public class Toto
    {
        [FirestoreProperty]
        public string? name { get; set; }
    }


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
        public async Task<List<TourneyDto>> ListTourneys(CancellationToken ct)
        {
            return (await _service.ListTourneys(0, _context, ct)).Select(_mapper.Map<TourneyDto>).ToList();
        }

        [HttpGet]
        [Route("Tourneys/{teamId}")]
        public async Task<List<TourneyDto>> ListTourneys(int teamId, CancellationToken ct)
        {
            return (await _service.ListTourneys(teamId, _context, ct)).Select(_mapper.Map<TourneyDto>).ToList();
        }


        [HttpGet]
        [Route("Teams")]
        public async Task<List<TeamDto>> ListTeams(CancellationToken ct)
        {
            return (await _service.ListTeams(_context, ct, onlyMainTeam: true)).Select(_mapper.Map<TeamDto>).ToList();
        }

        [HttpGet]
        [Route("Team/{teamId}")]
        public async Task<RankingDto> GetTeam(int teamId, [FromQuery] string[]? seasons, [FromQuery] string[]? categories, CancellationToken ct)
        {
            return await _service.GetTeamScore(teamId, seasons ?? [], categories ?? [], _context, ct);
        }



        [HttpGet]
        [Route("{uuid}/Ranking")]
        public async Task<RankingDto> GetRanking(string uuid, CancellationToken ct)
        {
            string? login = GetLogin();

            var useEstimate = HttpContext.Request.Headers["CJoli-UseEstimate"];

            return await _service.CreateRanking(uuid, login, useEstimate == "true", _context, ct);
        }

        [HttpGet]
        [Route("{uuid}/Gallery/{page}")]
        public async Task<GalleryDto> GetGallery(string uuid, int page, [FromQuery] bool waiting, [FromQuery] bool random, CancellationToken ct)
        {
            string? login = GetLogin();
            return await _service.CreateGallery(uuid, page, login, waiting, random, _context, ct);
        }



        [HttpGet]
        [Route("{uuid}/Export")]
        public async Task<TourneyDto> Export(string uuid, CancellationToken ct)
        {
            return _mapper.Map<TourneyDto>(await _service.GetTourney(uuid, _context, ct));
        }

        [HttpPost]
        [Route("Import")]
        public string Import(TourneyDto tourneyDto, CancellationToken ct)
        {
            var tourney = _settingService.Import(tourneyDto, _context);
            return tourney.Uid;
        }

        [HttpPost]
        [Authorize]
        [Route("{uuid}/SaveMatch")]
        public async Task<RankingDto> SaveMatch([FromRoute] string uuid, [FromBody] MatchDto match, CancellationToken ct)
        {
            using (LogContext.PushProperty("uid", uuid))
            {
                var login = GetLogin();
                await _service.SaveMatch(match, login!, uuid, _context, ct);
                _logger.LogInformationWithData("SaveMatch", match);
                return await GetRanking(uuid, ct);
            }
        }

        [HttpPost]
        [Authorize]
        [Route("{uuid}/UpdateMatch")]
        public async Task<RankingDto> UpdateMatch([FromRoute] string uuid, [FromBody] MatchDto match, CancellationToken ct)
        {
            using (LogContext.PushProperty("uid", uuid))
            {
                var login = GetLogin();
                await _service.UpdateMatch(match, login!, uuid, _context, ct);
                _logger.LogInformationWithData("SaveMatch", match);
                return await GetRanking(uuid, ct);
            }
        }


        [HttpPost]
        [Authorize]
        [Route("{uuid}/ClearMatch")]
        public async Task<RankingDto> ClearMatch([FromRoute] string uuid, [FromBody] MatchDto match, CancellationToken ct)
        {
            using (LogContext.PushProperty("uid", uuid))
            {
                var login = GetLogin();
                await _service.ClearMatch(match, login!, uuid, _context, ct);
                _logger.LogInformationWithData("ClearMatch", match);
                return await GetRanking(uuid, ct);
            }
        }

        [HttpPost]
        [Authorize]
        [Route("{uuid}/ClearSimulations")]
        public async Task<RankingDto> ClearSimulations([FromRoute] string uuid, [FromBody] int[] ids, CancellationToken ct)
        {
            using (LogContext.PushProperty("uid", uuid))
            {
                var login = GetLogin();
                await _service.ClearSimulations(ids, login!, uuid, _context, ct);
                _logger.LogInformationWithData("ClearSimulation", ids);
                return await GetRanking(uuid, ct);
            }
        }


        [HttpPost]
        [Authorize]
        [Route("{uuid}/UpdateTeam")]
        public async Task<RankingDto> UpdateTeam([FromRoute] string uuid, [FromBody] TeamDto teamDto, CancellationToken ct)
        {
            var login = GetLogin();
            await _service.UpdateTeam(uuid, teamDto, _context, ct);
            return await GetRanking(uuid, ct);
        }

        [HttpPost]
        [Authorize]
        [Route("{uuid}/UpdatePosition")]
        public async Task<RankingDto> UpdatePosition([FromRoute] string uuid, [FromBody] PositionDto positionDto, CancellationToken ct)
        {
            var login = GetLogin();
            await _service.UpdatePosition(uuid, positionDto, _context, ct);
            return await GetRanking(uuid, ct);
        }


        [HttpPost]
        [Route("{uuid}/SaveUserConfig")]
        public async Task<RankingDto> SaveUserConfig(string uuid, UserConfigDto config, CancellationToken ct)
        {
            var login = GetLogin();
            if (login != null)
            {
                await _service.SaveUserConfig(uuid, login, config, _context, ct);
            }
            return await GetRanking(uuid, ct);
        }

        [HttpGet]
        [Route("{uuid}/Prompt")]
        public async Task<string?> Prompt(string uuid, [FromQuery] string lang, [FromQuery] bool useEstimate, CancellationToken ct)
        {
            var login = GetLogin();
            var dto = await _service.CreateRanking(uuid, login, useEstimate, _context, ct);
            return await _aiService.Prompt(uuid, lang, login, dto, _context);
        }

        [HttpPost]
        [Authorize("IsAdmin")]
        [Route("{uuid}/UpdateEvent")]
        public async Task<RankingDto> UpdatEvent([FromRoute] string uuid, [FromBody] EventDto dto, [FromQuery] bool useEstimate, CancellationToken ct)
        {
            using (LogContext.PushProperty("uid", uuid))
            {
                var login = GetLogin();
                await _service.UpdateEvent(uuid, login, dto, _context, ct);
                return await GetRanking(uuid, ct);
            }
        }

        [HttpPost]
        [Route("{uuid}/Upload")]
        [RequestSizeLimit(10_000_000)]
        public async Task<IActionResult> OnPostUploadAsync([FromRoute] string uuid, List<IFormFile> files, CancellationToken ct)
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
