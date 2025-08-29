using cjoli.Server.Dtos;
using cjoli.Server.Models;
using cjoli.Server.Services;
using Microsoft.EntityFrameworkCore.Storage;

namespace cjoli.Server_Tests.Services
{
    [Collection("CJoli")]
    public class SettingServiceTest : IDisposable
    {
        private readonly SettingService _service;
        private readonly CJoliContext _context;
        private readonly IDbContextTransaction _transaction;

        public SettingServiceTest(SettingService service, CJoliContext context)
        {
            _service = service;
            _context = context;
            _transaction = _context.Database.BeginTransaction();
        }

        public void Dispose()
        {
            _transaction.Rollback();
        }

        private TourneyDto CreateTourney(int teamId = 0)
        {
            return new TourneyDto()
            {
                Teams = [new TeamDto() { Id = teamId, Name = "team" }],
                Phases = [new PhaseDto() {
                    Name = "phase",
                    Squads = [new SquadDto() {
                        Name = "squad",
                        Positions = [new PositionDto() {
                            Value=1,
                            TeamId = teamId,
                            ParentPosition = new ParentPositionDto(){Phase="phase",Squad="squad"}
                        }],
                        Matches = [ new MatchDto() { PositionA=1, PositionB=1}]
                    }]
                }],
                Ranks = [new RankDto() { Order = 1, Phase = "phase", Squad = "squad" }]
            };
        }

        [Fact]
        public void Import()
        {
            //Arrange
            var dto = CreateTourney();
            //Act
            var tourney = _service.Import(dto, _context);
            //Assert
            Assert.True(tourney.Id > 0);
            Assert.NotNull(tourney.Uid);
            var team = Assert.Single(tourney.Teams);
            Assert.True(team.Id > 0);
            Assert.Equal("team", team.Name);
            var phase = Assert.Single(tourney.Phases);
            Assert.True(phase.Id > 0);
            Assert.Equal("phase", phase.Name);
            var squad = Assert.Single(phase.Squads);
            Assert.True(squad.Id > 0);
            Assert.Equal("squad", squad.Name);
            var position = Assert.Single(squad.Positions);
            Assert.True(position.Id > 0);
            //Assert.Equal(team.Id, position.Team?.Id);
            var match = Assert.Single(squad.Matches);
            Assert.True(match.Id > 0);
            var rank = Assert.Single(tourney.Ranks);
            Assert.True(rank.Id > 0);
        }

        [Fact]
        public void Import_Update()
        {
            //Arrange
            var dto = CreateTourney();
            var t = _service.Import(dto, _context);
            dto.Uid = t.Uid;
            dto.Name = "newName";
            dto.Teams.First().Id = t.Teams.First().Id;
            //Act
            var tourney = _service.Import(dto, _context);
            //Assert
            Assert.Equal("newName", tourney.Name);
        }
    }
}
