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
        public RankingDto Get()
        {
            return _mapper.Map<RankingDto>(_service.GetRanking("123", _context));
            //return _service.GetRanking("123", _context);
        }
    }
}
