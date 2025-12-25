using AutoMapper;
using cjoli.Server.Dtos;
using cjoli.Server.Models;
using cjoli.Server.Services;
using Microsoft.EntityFrameworkCore.Storage;

namespace cjoli.Server_Tests.Services
{
    [Collection("CJoli")]
    public class EstimateServiceTest : AbstractTest, IDisposable
    {
        private readonly EstimateService _service;
        private readonly CJoliService _cjoliService;
        private readonly IMapper _mapper;
        private readonly IDbContextTransaction _transaction;

        public EstimateServiceTest(EstimateService service, CJoliService cjoliService, IMapper mapper, CJoliContext context) : base(context)
        {
            _service = service;
            _cjoliService = cjoliService;
            _mapper = mapper;
            _transaction = _context.Database.BeginTransaction();
        }

        public void Dispose()
        {
            _transaction.Rollback();
        }

        [Fact]
        public async Task CalculateEstimates()
        {
            //Arrange
            var tourney = CreateTourney();
            var user = CreateUser();
            var ct = new CancellationToken();
            var ranking = await _cjoliService.CreateRanking(tourney.Uid, null, false, _context, ct);
            var match = Match(tourney);

            Assert.Empty(match.Estimates);
            //Act
            await _service.CalculateEstimates(tourney, ranking.Scores, user, _context, ct);
            var estimate = Assert.Single(match.Estimates);
            Assert.Equal(0, estimate.ScoreA);
            Assert.Equal(0, estimate.ScoreB);
        }

        [Theory]
        [InlineData("ADMIN")]
        [InlineData("USER")]
        public async Task CalculateEstimates_Win(string role)
        {
            //Arrange
            var tourney = CreateTourney();
            var user = CreateUser(role);

            var match = Match(tourney);
            match.ScoreA = 1;
            var dto = _mapper.Map<MatchDto>(match);
            var ct = new CancellationToken();
            await _cjoliService.SaveMatch(dto, user.Login, tourney.Uid, _context, ct);

            var ranking = await _cjoliService.CreateRanking(tourney.Uid, user.Login, true, _context, ct);
            var match2 = Match(tourney, "squad2");

            //Assert.Empty(match2.Estimates);
            //Act
            await _service.CalculateEstimates(tourney, ranking.Scores, user, _context, ct);
            //Assert
            var estimate = match2.Estimates.First();
            Assert.True(estimate.ScoreA > estimate.ScoreB);
        }

        [Fact]
        public async Task CalculateEstimates_User_Phase2()
        {
            //Arrange
            var tourney = CreateTourney();
            var user = CreateUser("USER");

            var match = Match(tourney);
            match.ScoreA = 1;
            var dto = _mapper.Map<MatchDto>(match);
            var ct = new CancellationToken();
            await _cjoliService.SaveMatch(dto, user.Login, tourney.Uid, _context, ct);

            var squad2 = Squad("squad2", tourney);
            var position1 = Position("position2-1", tourney);
            var position2 = Position("position2-2", tourney);
            var match3 = new Match() { PositionA = position1, PositionB = position2 };
            squad2.Matches.Add(match3);
            _context.SaveChanges();
            await _cjoliService.SaveMatch(_mapper.Map<MatchDto>(match3), user.Login, tourney.Uid, _context, ct);

            var ranking = await _cjoliService.CreateRanking(tourney.Uid, user.Login, true, _context, ct);
            var match2 = Match(tourney, "squad2");

            //Act
            await _service.CalculateEstimates(tourney, ranking.Scores, user, _context, ct);
            //Assert
            var estimate = Assert.Single(match2.Estimates);
            Assert.True(estimate.ScoreA > estimate.ScoreB);
        }

        [Fact]
        public async Task CalculateEstimates_Shot()
        {
            //Arrange
            var tourney = CreateTourney();
            var user = CreateUser("USER");
            var team1 = Team("team1", tourney);
            var team2 = Team("team2", tourney);
            var match = CreateMatch(tourney, team1, team2, m =>
            {
                m.Shot = true;
            });

            var ct = new CancellationToken();
            var ranking = await _cjoliService.CreateRanking(tourney.Uid, user.Login, false, _context, ct);
            //Act
            await _service.CalculateEstimates(tourney, ranking.Scores, user, _context, ct);
            //Assert
            var estimate = Assert.Single(match.Estimates);
            Assert.True(estimate.ScoreB != estimate.ScoreA);
        }



    }
}
