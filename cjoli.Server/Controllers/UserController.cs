using AutoMapper;
using cjoli.Server.Datas;
using cjoli.Server.Dtos;
using cjoli.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace cjoli.Server.Controllers
{

    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserService _service;
        private readonly IMapper _mapper;
        private readonly CJoliContext _context;

        public UserController(UserService service, IMapper mapper, CJoliContext context)
        {
            _service = service;
            _mapper = mapper;
            _context = context;
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


    }
}
