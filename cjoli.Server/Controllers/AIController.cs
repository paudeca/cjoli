using AutoMapper;
using cjoli.Server.Models;
using cjoli.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace cjoli.Server.Controllers
{

    [ApiController]
    [Route("[controller]")]
    public class AIController : ControllerBase
    {
        private readonly AIService _service;
        private readonly IMapper _mapper;
        private readonly CJoliContext _context;


        public AIController(AIService service, IMapper mapper, CJoliContext context)
        {
            _service = service;
            _mapper = mapper;
            _context = context;
        }

        [HttpGet]
        public async Task<string> Get()
        {
            return await _service.Test(_context);
        }

    }
}
