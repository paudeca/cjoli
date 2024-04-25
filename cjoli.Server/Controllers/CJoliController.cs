using AutoMapper;
using cjoli.Server.Datas;
using cjoli.Server.Dtos;
using cjoli.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace cjoli.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CJoliController : ControllerBase
    {
        private readonly CJoliService _service;
        private readonly IMapper _mapper;
        private readonly CJoliContext _context;

        public CJoliController(CJoliService service, IMapper mapper, CJoliContext context)
        {
            _service = service;
            _mapper = mapper;
            _context = context;
        }
        [HttpGet]
        public TourneyDto Get()
        {
            //return _context.Tourneys.Select(t => _mapper.Map<TourneyDto>(t)).ToList();
            return _mapper.Map<TourneyDto>(_service.GetRanking("123", _context));
        }
    }
}
