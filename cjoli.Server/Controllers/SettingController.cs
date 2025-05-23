﻿using AutoMapper;
using cjoli.Server.Dtos;
using cjoli.Server.Models;
using cjoli.Server.Models.AI;
using cjoli.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cjoli.Server.Controllers
{

    [ApiController]
    [Authorize("IsAdmin")]
    [Route("[controller]")]
    public class SettingController : ControllerBase
    {
        private readonly CJoliService _service;
        private readonly SettingService _settingService;
        private readonly UserService _userService;
        private readonly IMapper _mapper;
        private readonly CJoliContext _context;
        private readonly IAuthorizationService _authorizationService;
        private readonly SynchroService _synchroService;

        public SettingController(CJoliService service, SettingService settingService, UserService userService, IAuthorizationService authorizationService, SynchroService synchroService, IMapper mapper, CJoliContext context)
        {
            _service = service;
            _settingService = settingService;
            _userService = userService;
            _mapper = mapper;
            _context = context;
            _authorizationService = authorizationService;
            _synchroService = synchroService;
        }


        [HttpGet]
        [Route("Teams")]
        public List<TeamDto> ListTeams()
        {
            return _service.ListTeams(_context).Select(_mapper.Map<TeamDto>).ToList();
        }

        [HttpPost]
        [Route("Tourney")]
        public async Task<TourneyDto> UpdateAsync(TourneyDto tourney)
        {
            await _authorizationService.AuthorizeAsync(User, tourney.Uid, "EditTourney");
            return _mapper.Map<TourneyDto>(_settingService.Import(tourney, _context));
        }

        [HttpPost]
        [Route("Tourney/{uid}/Synchro")]
        public async Task<TourneyDto> SynchroAsync(string uid)
        {
            await _authorizationService.AuthorizeAsync(User, uid, "EditTourney");
            return _mapper.Map<TourneyDto>(await _synchroService.Synchro(uid, _context));
        }



        [HttpPost]
        [Route("User/{user}/admins")]
        [Authorize("IsRootAdmin")]
        public void SaveUserAdmins(int user, int[] tourneys)
        {
            _userService.SaveUserAdmins(user, tourneys, _context);
        }

        [HttpPost]
        [Route("{uid}/Message")]
        [Authorize("IsAdmin")]
        public async void UpdateMessage(string uid, MessageDto message)
        {
            await _authorizationService.AuthorizeAsync(User, uid, "EditTourney");
            _settingService.UpdateMessage(message, _context);
        }

        [HttpDelete]
        [Route("{uid}/Message/{msgId}")]
        [Authorize("IsAdmin")]
        public async void DeleteMessage(string uid, int msgId)
        {
            await _authorizationService.AuthorizeAsync(User, uid, "EditTourney");
            _settingService.DeleteMessage(msgId, uid, _context);
        }


        [HttpDelete]
        [Route("Tourney/{uid}")]
        [Authorize("IsRootAdmin")]
        public void RemoveTourney(string uid)
        {
            _settingService.RemoveTourney(uid, _context);
        }


        [HttpDelete]
        [Route("Tourney/{uid}/teams/{teamId}")]
        public async Task<TourneyDto> RemoveTeam(string uid, int teamId)
        {
            await _authorizationService.AuthorizeAsync(User, uid, "EditTourney");
            return _mapper.Map<TourneyDto>(_settingService.RemoveTeam(uid, teamId, _context));
        }

        [HttpDelete]
        [Route("Tourney/{uid}/phases/{phaseId}")]
        public async Task<TourneyDto> RemovePhase(string uid, int phaseId)
        {
            await _authorizationService.AuthorizeAsync(User, uid, "EditTourney");
            return _mapper.Map<TourneyDto>(_settingService.RemovePhase(uid, phaseId, _context));
        }

        [HttpDelete]
        [Route("Tourney/{uid}/phases/{phaseId}/squads/{squadId}")]
        public async Task<TourneyDto> RemoveSquad(string uid, int phaseId, int squadId)
        {
            await _authorizationService.AuthorizeAsync(User, uid, "EditTourney");
            return _mapper.Map<TourneyDto>(_settingService.RemoveSquad(uid, phaseId, squadId, _context));
        }

        [HttpDelete]
        [Route("Tourney/{uid}/phases/{phaseId}/squads/{squadId}/positions/{positionId}")]
        public async Task<TourneyDto> RemovePosition(string uid, int phaseId, int squadId, int positionId)
        {
            await _authorizationService.AuthorizeAsync(User, uid, "EditTourney");
            return _mapper.Map<TourneyDto>(_settingService.RemovePosition(uid, phaseId, squadId, positionId, _context));
        }

        [HttpDelete]
        [Route("Tourney/{uid}/phases/{phaseId}/squads/{squadId}/matches/{matchId}")]
        public async Task<TourneyDto> RemoveMatch(string uid, int phaseId, int squadId, int matchId)
        {
            await _authorizationService.AuthorizeAsync(User, uid, "EditTourney");
            return _mapper.Map<TourneyDto>(_settingService.RemoveMatch(uid, phaseId, squadId, matchId, _context));
        }

        [HttpDelete]
        [Route("Tourney/{uid}/ranks/{rankId}")]
        public async Task<TourneyDto> RemoveRank(string uid, int rankId)
        {
            await _authorizationService.AuthorizeAsync(User, uid, "EditTourney");
            return _mapper.Map<TourneyDto>(_settingService.RemoveRank(uid, rankId, _context));
        }

        [HttpDelete]
        [Route("users/{userId}")]
        public void RemoveUser(int userId)
        {
            _userService.RemoveUser(userId, _context);
        }

        [HttpDelete]
        [Route("Tourney/{uid}/phases/{phaseId}/events/{eventId}")]
        public async Task<TourneyDto> RemoveEvent(string uid, int phaseId, int eventId)
        {
            await _authorizationService.AuthorizeAsync(User, uid, "EditTourney");
            return _mapper.Map<TourneyDto>(_settingService.RemoveEvent(uid, phaseId, eventId, _context));
        }



    }
}
