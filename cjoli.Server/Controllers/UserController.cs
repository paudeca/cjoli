using AutoMapper;
using cjoli.Server.Dtos;
using cjoli.Server.Exceptions;
using cjoli.Server.Models;
using cjoli.Server.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace cjoli.Server.Controllers
{

    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserService _service;
        private readonly IMapper _mapper;
        private readonly CJoliContext _context;
        private readonly ILogger<UserController> _logger;

        public UserController(UserService service, IMapper mapper, CJoliContext context, ILogger<UserController> logger)
        {
            _service = service;
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
        public UserDto? Get()
        {
            var login = GetLogin();
            if (login == null)
            {
                return null;
            }
            return _mapper.Map<UserDto>(_service.GetUserDetail(login, _context));
        }

        [HttpPost]
        [Route("Register")]
        public UserDto Register(UserDto dto)
        {
            _logger.LogInformation("User register {@data}",dto.Login);
            return _mapper.Map<UserDto>(_service.Register(dto, _context));
        }

        [HttpPost]
        [Route("Login")]
        public IResult Login(UserDto userDto)
        {
            _logger.LogInformation("Login user {@data}",userDto);
            if (string.IsNullOrEmpty(userDto.Password))
            {
                throw new IllegalArgumentException("password");
            }
            string token = _service.Login(userDto.Login, userDto.Password, _context);
            _logger.LogDebug("User connected");
            return Results.Ok(token);
        }

        [HttpPost]
        [Route("Update")]
        public bool Update(UserDto user)
        {
            _logger.LogInformation("Update user {@data}", user);
            var login = GetLogin();
            if (login == null || user.Password == null)
            {
                return false;
            }
            return _service.Update(login, user.Password, _context);
        }

    }
}
