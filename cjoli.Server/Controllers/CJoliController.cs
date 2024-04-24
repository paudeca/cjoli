using AutoMapper;
using cjoli.Server.Datas;
using cjoli.Server.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace cjoli.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CJoliController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly CJoliContext _context;

        public CJoliController(IMapper mapper, CJoliContext context)
        {
            _mapper = mapper;
            _context = context;
        }
        [HttpGet]
        public IEnumerable<TourneyDto> Get()
        {
            return _context.Tourneys.Select(t => _mapper.Map<TourneyDto>(t)).ToList();
        }
    }
}
