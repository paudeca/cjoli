using AutoMapper;
using cjoli.Server.Dtos;
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

        private string? GetLogin()
        {
            if (User.Identity == null || !this.User.Identity.IsAuthenticated)
            {
                return null;
            }
            return User.Claims.First(i => i.Type == ClaimTypes.NameIdentifier).Value;
        }

        public UserController(UserService service, IMapper mapper, CJoliContext context)
        {
            _service = service;
            _mapper = mapper;
            _context = context;
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
            return _mapper.Map<UserDto>(_service.Register(dto, _context));
        }

        [HttpPost]
        [Route("Login")]
        public IResult Login(UserDto userDto)
        {
            string token = _service.Login(userDto.Login, userDto.Password, _context);
            return Results.Ok(token);
        }

        [HttpPost]
        [Route("Update")]
        public bool Update(UserUpdate user)
        {
            var login = GetLogin();
            if (login == null)
            {
                return false;
            }
            return _service.Update(login, user.Password, _context);
        }

    }

    public class UserUpdate
    {
        public required string Password { get; set; }
    }
}
