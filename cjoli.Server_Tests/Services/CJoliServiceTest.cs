using AutoMapper;
using cjoli.Server.Dtos;
using cjoli.Server.Exceptions;
using cjoli.Server.Models;
using cjoli.Server.Services;
using cjoli.Server.Services.Rules;
using Microsoft.EntityFrameworkCore.Storage;

namespace cjoli.Server_Tests.Services
{
    [Collection("CJoli")]
    public class CJoliServiceTest : AbstractTest, IDisposable
    {
        private readonly CJoliService _service;
        private readonly IDbContextTransaction _transaction;
        private readonly IMapper _mapper;

        public CJoliServiceTest(CJoliService service, CJoliContext context, IMapper mapper) : base(context)
        {
            _service = service;
            _mapper = mapper;
            _transaction = _context.Database.BeginTransaction();
        }

        public void Dispose()
        {
            _transaction.Rollback();
        }


        [Fact]
        public void ListTourneys_Found()
        {
            //Arrange
            var tourney = CreateTourney();

            //Act
            var tourneys = _service.ListTourneys(0, _context);

            //Assert
            Assert.NotEmpty(tourneys);
            Assert.Single(tourneys);
            var result = tourneys.First();
            Assert.Equal(tourney.Uid, result.Uid);
            Assert.Equal(tourney.Name, result.Name);
        }


        [Fact]
        public void GetTourney_NotFound()
        {
            //Act & Assert
            Assert.Throws<NotFoundException>(() => _service.GetTourney("", _context));
        }

        [Fact]
        public void GetTourney_Found()
        {
            //Arrange
            var tourney = CreateTourney();

            //Act
            var result = _service.GetTourney(tourney.Uid, _context);

            //Assert
            Assert.Same(tourney.Uid, result.Uid);
            Assert.Same(tourney.Name, result.Name);
        }

        [Theory]
        [InlineData(0, 0, 0, 1)]
        [InlineData(1, 0, 0, 1)]
        [InlineData(0, 1, 1, 0)]
        public void CreateRanking(int score1, int score2, int rank1, int rank2)
        {
            //Arrange
            var tourney = CreateTourney();
            var user = CreateUser();
            _service.ClearCache(tourney.Uid, user, _context);
            var team1 = Team("team1", tourney);
            var team2 = Team("team2", tourney);
            CreateMatch(tourney, team1, team2, match =>
            {
                match.ScoreA = score1;
                match.ScoreB = score2;
                match.Done = true;
            });
            //Act
            var ranking = _service.CreateRanking(tourney.Uid, user.Login, false, _context);
            //Assert
            Assert.Same(tourney.Uid, ranking.Tourney.Uid);
            Assert.NotNull(ranking.Scores);
            Assert.NotNull(ranking.Scores.ScoreTourney);
            var FindIndex = (int teamId) => ranking.Scores.ScoreSquads.First().Scores.FindIndex(s => s.TeamId == teamId);
            var team1Rank = FindIndex(team1.Id);
            var team2Rank = FindIndex(team2.Id);
            Assert.True((team1Rank == rank1 && team2Rank == rank2) || (team1Rank == rank2 && team2Rank == rank1));

        }

        [Theory]
        [InlineData(1, 0)]
        [InlineData(0, 1)]
        public void CreateRanking_Order_Direct(int score1, int score2)
        {
            //Arrange
            var tourney = CreateTourney();
            var user = CreateUser();
            _service.ClearCache(tourney.Uid, user, _context);

            var team1 = Team("team1", tourney);
            var team2 = Team("team2", tourney);
            var team3 = CreateTeam("team3", tourney);
            CreateMatch(tourney, team1, team3, match =>
            {
                match.ScoreA = 1;
                match.Done = true;
            });
            CreateMatch(tourney, team2, team3, match =>
            {
                match.ScoreA = 1;
                match.Done = true;
            });
            CreateMatch(tourney, team1, team2, match =>
            {
                match.ScoreA = score1;
                match.ScoreB = score2;
                match.Done = true;
            });
            CreateMatch(tourney, score1 > score2 ? team2 : team1, team3, match =>
            {
                match.Done = true;
            });

            //Act
            var ranking = _service.CreateRanking(tourney.Uid, user.Login, false, _context);
            var result = string.Join(' ', ranking.Scores.ScoreSquads.First().Scores.Select((s, i) => $"{i}:{s.TeamId}:{s.Total}"));
            //Assert
            Assert.Same(tourney.Uid, ranking.Tourney.Uid);
            Assert.NotNull(ranking.Scores);
            Assert.NotNull(ranking.Scores.ScoreTourney);
            var first = score1 > score2 ? 1 : 2;
            var second = score1 > score2 ? 2 : 1;
            Assert.Equal($"0:{first}:6 1:{second}:6 2:3:4", result);
        }

        [Theory]
        [InlineData(2, 1, 0, 0)]
        [InlineData(1, 2, 0, 0)]
        [InlineData(2, 1, 1, 0)]
        public void CreateRanking_Order_Goal(int score1, int score2, int score3_1, int score3_2)
        {
            //Arrange
            var tourney = CreateTourney();
            var user = CreateUser();
            _service.ClearCache(tourney.Uid, user, _context);

            var team1 = Team("team1", tourney);
            var team2 = Team("team2", tourney);
            var team3 = CreateTeam("team3", tourney);
            CreateMatch(tourney, team1, team3, match =>
            {
                match.ScoreA = score1;
                match.ScoreB = score3_1;
                match.Done = true;
            });
            CreateMatch(tourney, team2, team3, match =>
            {
                match.ScoreA = score2;
                match.ScoreB = score3_2;
                match.Done = true;
            });
            CreateMatch(tourney, team1, team2, match =>
            {
                match.ScoreA = 0;
                match.ScoreB = 0;
                match.Done = true;
            });

            //Act
            var ranking = _service.CreateRanking(tourney.Uid, user.Login, false, _context);
            var result = string.Join(' ', ranking.Scores.ScoreSquads.First().Scores.Select((s, i) => $"{i}:{s.TeamId}:{s.Total}"));
            //Assert
            Assert.Same(tourney.Uid, ranking.Tourney.Uid);
            Assert.NotNull(ranking.Scores);
            Assert.NotNull(ranking.Scores.ScoreTourney);
            var first = score1 > score2 ? 1 : 2;
            var second = score1 > score2 ? 2 : 1;
            Assert.Equal($"0:{first}:5 1:{second}:5 2:3:2", result);
        }


        [Fact]
        public void AfftectationTeams_Ok()
        {
            //Arrange
            var tourney = CreateTourney();
            var team1 = Team("team1", tourney);
            var team2 = Team("team2", tourney);

            //Act
            var dto = _service.CreateRanking(tourney.Uid, null, false, _context);
            var match = dto.Tourney.Phases.First().Squads.First().Matches.First();
            //Assert
            Assert.Equal(team1.Id, match.TeamIdA);
            Assert.Equal(team2.Id, match.TeamIdB);
        }

        [Fact]
        public void AfftectationTeams_ParentPosition()
        {
            //Arrange
            var tourney = CreateTourney();
            var team1 = Team("team1", tourney);
            var team2 = Team("team2", tourney);
            CreateMatch(tourney, team1, team2, match =>
            {
                match.ScoreA = 1;
                match.Done = true;
            });


            //Act
            var dto = _service.CreateRanking(tourney.Uid, null, false, _context);
            //Assert
            var positions = dto.Tourney.Phases.SelectMany(p => p.Squads).SelectMany(s => s.Positions);
            var position1 = positions.Single(p => p.Name == "position2-1");
            var position2 = positions.Single(p => p.Name == "position2-2");
            Assert.Equal(team1.Id, position1.TeamId);
            Assert.Equal(team2.Id, position2.TeamId);

        }


        [Fact]
        public void CalculateHistory_Ok()
        {
            //Arrange
            var tourney = CreateTourney();
            var team1 = Team("team1", tourney);
            var team2 = Team("team2", tourney);

            //Act
            var dto = _service.CreateRanking(tourney.Uid, null, false, _context);
            //Assert
            Assert.True(dto.History.ContainsKey(team1.Id));
            Assert.True(dto.History.ContainsKey(team2.Id));
            Assert.True(dto.Scores.ScoreTeams.ContainsKey(team1.Id));
            Assert.True(dto.Scores.ScoreTeams.ContainsKey(team2.Id));
        }

        [Fact]
        public void SetConfig()
        {
            //Arrange
            var tourney = CreateTourney();

            //Act
            var ranking = _service.CreateRanking(tourney.Uid, null, false, _context);
            var dto = _mapper.Map<RankingDto>(ranking);
            //Assert
            Assert.NotNull(dto.Tourney.Config);
        }

        [Fact]
        public void UpdateScore()
        {
            //Arrange
            var tourney = CreateTourney();
            var match = Match(tourney);
            match.ScoreA = 1;
            var scoreA = new Score();
            var scoreB = new Score();
            //Act
            _service.UpdateScore(scoreA, scoreB, null, match, match, new ScoobyRule(_service));
            //Assert
            Assert.Equal(1, scoreA.Game);
            Assert.Equal(1, scoreA.Win);
            Assert.Equal(0, scoreA.Neutral);
            Assert.Equal(0, scoreA.Loss);
            Assert.Equal(1, scoreA.GoalFor);
            Assert.Equal(0, scoreA.GoalAgainst);
            Assert.Equal(1, scoreA.ShutOut);
            Assert.Equal(1, scoreA.GoalDiff);

            Assert.Equal(1, scoreB.Game);
            Assert.Equal(0, scoreB.Win);
            Assert.Equal(0, scoreB.Neutral);
            Assert.Equal(1, scoreB.Loss);
            Assert.Equal(0, scoreB.GoalFor);
            Assert.Equal(1, scoreB.GoalAgainst);
            Assert.Equal(0, scoreB.ShutOut);
            Assert.Equal(-1, scoreB.GoalDiff);

        }

        [Fact]
        public void SaveMatch()
        {
            //Arrange
            var user = CreateUser();
            var tourney = CreateTourney();
            _service.ClearCache(tourney.Uid, user, _context);

            var match = Match(tourney);
            var dto = _mapper.Map<MatchDto>(match);
            dto.ScoreA = 1;
            dto.ScoreB = 0;

            Assert.False(match.Done);
            Assert.Equal(0, match.ScoreA);
            Assert.Equal(0, match.ScoreB);
            //Act
            _service.SaveMatch(dto, user.Login, tourney.Uid, _context);
            //Assert
            Assert.True(match.Done);
            Assert.Equal(1, match.ScoreA);
            Assert.Equal(0, match.ScoreB);
        }

        [Fact]
        public void SaveMatch_NotFound()
        {
            //Arrange
            var user = CreateUser();
            var tourney = CreateTourney();
            //Act            
            //Assert
            Assert.Throws<NotFoundException>(() => _service.SaveMatch(new MatchDto(), user.Login, tourney.Uid, _context));
        }

        [Theory]
        [InlineData("ADMIN")]
        [InlineData("USER")]
        public void SaveMatch_Forfeit(string role)
        {
            //Arrange
            var user = CreateUser(role);
            var tourney = CreateTourney();
            var match = Match(tourney);
            var dto = _mapper.Map<MatchDto>(match);
            dto.ForfeitB = true;

            //Act
            _service.SaveMatch(dto, user.Login, tourney.Uid, _context);
            //Assert
            if (role == "ADMIN")
            {
                Assert.True(match.Done);
                Assert.True(match.ForfeitB);
            }
            else
            {
                Assert.False(match.Done);
                Assert.False(match.ForfeitB);
                Assert.True(match.UserMatches.First().ForfeitB);
            }
        }


        [Fact]
        public void SaveMatch_User_Admin()
        {
            //Arrange
            var user = CreateUser("User");
            var tourney = CreateTourney();
            var match = Match(tourney);
            var dto = _mapper.Map<MatchDto>(match);
            dto.ScoreA = 1;
            dto.ScoreB = 0;

            _service.SaveMatch(dto, user.Login, tourney.Uid, _context);
            Assert.False(match.Done);
            Assert.Equal(1, match.UserMatches.First().ScoreA);
            Assert.Equal(0, match.UserMatches.First().ScoreB);

            user = CreateUser("ADMIN");

            //Act
            _service.SaveMatch(dto, user.Login, tourney.Uid, _context);
            //Assert
            Assert.True(match.Done);
            Assert.Equal(1, match.ScoreA);
            Assert.Equal(0, match.ScoreB);
        }


        [Fact]
        public void ClearMatch()
        {
            //Arrange
            var user = CreateUser();
            var tourney = CreateTourney();
            var match = Match(tourney);
            var dto = _mapper.Map<MatchDto>(match);
            dto.ScoreA = 1;
            dto.ScoreB = 0;

            _service.SaveMatch(dto, user.Login, tourney.Uid, _context);
            //Act
            _service.ClearMatch(dto, user.Login, tourney.Uid, _context);
            //Assert
            Assert.False(match.Done);
            Assert.Equal(0, match.ScoreA);
            Assert.Equal(0, match.ScoreB);

        }

        [Fact]
        public void ClearMatch_NotFound()
        {
            //Arrange
            var user = CreateUser();
            var tourney = CreateTourney();

            //Act
            //Assert
            Assert.Throws<NotFoundException>(() => _service.ClearMatch(new MatchDto(), user.Login, tourney.Uid, _context));

        }

        [Fact]
        public void ClearMatch_User()
        {
            //Arrange
            var user = CreateUser("USER");
            var tourney = CreateTourney();
            var match = Match(tourney);
            var dto = _mapper.Map<MatchDto>(match);
            dto.ScoreA = 1;
            dto.ScoreB = 0;

            _service.SaveMatch(dto, user.Login, tourney.Uid, _context);
            Assert.False(match.Done);
            Assert.Equal(1, match.UserMatches.First().ScoreA);
            Assert.Equal(0, match.UserMatches.First().ScoreB);
            //Act
            _service.ClearMatch(dto, user.Login, tourney.Uid, _context);
            //Assert
            Assert.Empty(match.UserMatches);

        }



        [Fact]
        public void SaveUserConfig()
        {
            //Arrange
            var tourney = CreateTourney();
            var user = CreateUser();
            var dto = new UserConfigDto() { UseCustomEstimate = true };
            Assert.Empty(user.UserMatches.ToList());
            //Act
            _service.SaveUserConfig(tourney.Uid, user.Login, dto, _context);
            var config = Assert.Single(user.Configs.Where(c => c.Tourney == tourney));
            Assert.True(config.UseCustomEstimate);
        }

        [Fact]
        public void SaveUserConfig_NoTourney()
        {
            //Arrange
            var dto = new UserConfigDto() { UseCustomEstimate = true };
            //Act
            //Assert
            Assert.Throws<NotFoundException>(() => _service.SaveUserConfig("", "", dto, _context));
        }

        [Fact]
        public void SaveUserConfig_NoUser()
        {
            //Arrange
            var tourney = CreateTourney();
            var dto = new UserConfigDto() { UseCustomEstimate = true };
            //Act
            //Assert
            Assert.Throws<NotFoundException>(() => _service.SaveUserConfig(tourney.Uid, "", dto, _context));
        }


        [Fact]
        public void ClearSimulations()
        {
            //Arrange
            var tourney = CreateTourney();
            var user = CreateUser();
            var config = new UserConfigDto() { UseCustomEstimate = true };
            _service.SaveUserConfig(tourney.Uid, user.Login, config, _context);

            var match = Match(tourney);
            var dto = _mapper.Map<MatchDto>(match);
            dto.ScoreA = 1;
            dto.ScoreB = 0;
            _service.SaveMatch(dto, user.Login, tourney.Uid, _context);

            var userMatch = Assert.Single(user.UserMatches.Where(u => u.Match == match));

            //Act
            _service.ClearSimulations([userMatch.Id], user.Login, tourney.Uid, _context);

            //Assert
            Assert.Empty(user.UserMatches);
        }

        [Fact]
        public void UpdatePosition()
        {
            //Arrange
            var tourney = CreateTourney();
            var position = tourney.Phases.First().Squads.First().Positions.First();
            var dto = _mapper.Map<PositionDto>(position);
            dto.Penalty = 1;
            Assert.Equal(0, position.Penalty);
            //Act
            _service.UpdatePosition(tourney.Uid, dto, _context);
            //Assert
            Assert.Equal(1, position.Penalty);
        }

        [Fact]
        public void UpdateTeam()
        {
            //Arrange
            var tourney = CreateTourney();
            var team = tourney.Teams.First();
            var dto = _mapper.Map<TeamDto>(team);
            dto.Logo = "logo";
            dto.Youngest = new DateOnly();
            Assert.Null(team.Logo);
            Assert.Null(team.Youngest);
            //Act
            _service.UpdateTeam(tourney.Uid, dto, _context);
            //Assert
            Assert.Equal(dto.Logo, team.Logo);
            Assert.Equal(dto.Youngest, team.Youngest);
        }

        [Fact]
        public void UpdateTeam_NoTourney()
        {
            //Arrange
            //Act
            //Assert
            Assert.Throws<NotFoundException>(() => _service.UpdateTeam("", new TeamDto() { Name = "name" }, _context));
        }

        [Fact]
        public void UpdateTeam_NoTeam()
        {
            //Arrange
            var tourney = CreateTourney();
            //Act
            //Assert
            Assert.Throws<NotFoundException>(() => _service.UpdateTeam(tourney.Uid, new TeamDto() { Name = "name" }, _context));
        }


    }
}
