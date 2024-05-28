using AutoMapper;
using cjoli.Server.Dtos;
using cjoli.Server.Exceptions;
using cjoli.Server.Models;
using cjoli.Server.Services;
using cjoli.Server.Services.Rules;
using Microsoft.EntityFrameworkCore.Storage;

namespace cjoli.Server_Tests.Services
{
    public class CJoliServiceTest : IDisposable
    {
        private readonly CJoliService _service;
        private readonly CJoliContext _context;
        private readonly IDbContextTransaction _transaction;
        private readonly IMapper _mapper;

        private const string UID = "uid";
        private const string NAME = "name";
        private const string TEAM1 = "team1";
        private const string TEAM2 = "team2";

        private const string skip = null;//"disabled";

        public CJoliServiceTest(CJoliService service, CJoliContext context, IMapper mapper)
        {
            _service = service;
            _context = context;
            _mapper = mapper;
            _transaction = _context.Database.BeginTransaction();
        }

        public void Dispose()
        {
            _transaction.Rollback();
        }

        private Tourney CreateTourney()
        {
            var tourney = new Tourney() { Uid = UID, Name = NAME };

            var team1 = new Team() { Name = TEAM1 };
            var team2 = new Team() { Name = TEAM2 };
            tourney.Teams.Add(team1);
            tourney.Teams.Add(team2);


            var phase = new Phase() { Name = "phase1", Tourney = tourney };
            tourney.Phases.Add(phase);

            var squad = new Squad() { Name = "squad1", Phase = phase };
            phase.Squads.Add(squad);

            var position1 = new Position() { Team = team1 };
            squad.Positions.Add(position1);
            var position2 = new Position() { Team = team2 };
            squad.Positions.Add(position2);

            var match = new Match() { PositionA = position1, PositionB = position2 };
            squad.Matches.Add(match);

            tourney.Ranks.Add(new Rank() { Squad = squad, Tourney = tourney, Order = 1, Value = 1 });
            tourney.Ranks.Add(new Rank() { Squad = squad, Tourney = tourney, Order = 2, Value = 2 });

            _context.Tourneys.Add(tourney);

            _context.SaveChanges();
            return tourney;
        }

        private User CreateUser()
        {
            var user = new User() { Login = "login", Password = "", Role = "ADMIN" };
            _context.Users.Add(user);
            _context.SaveChanges();
            return user;
        }


        [Fact(Skip = skip)]
        public void ListTourneys_Found()
        {
            //Arrange
            CreateTourney();

            //Act
            var tourneys = _service.ListTourneys(_context);

            //Assert
            Assert.NotEmpty(tourneys);
            Assert.Single(tourneys);
            var tourney = tourneys.First();
            Assert.Equal(UID, tourney.Uid);
            Assert.Equal(NAME, tourney.Name);
        }


        [Fact(Skip = skip)]
        public void GetTourney_NotFound()
        {
            //Act & Assert
            Assert.Throws<NotFoundException>(() => _service.GetTourney("", _context));
        }

        [Fact(Skip = skip)]
        public void GetTourney_Found()
        {
            //Arrange
            CreateTourney();

            //Act
            var tourney = _service.GetTourney(UID, _context);

            //Assert
            Assert.Same(UID, tourney.Uid);
            Assert.Same(NAME, tourney.Name);
        }

        [Fact(Skip = skip)]
        public void GetRanking_Found()
        {
            //Arrange
            CreateTourney();
            //Act
            var ranking = _service.GetRanking(UID, null, _context);
            //Assert
            Assert.Same(UID, ranking.Tourney.Uid);
            Assert.NotNull(ranking.Scores);
            Assert.NotNull(ranking.Scores.ScoreTourney);
        }

        [Fact(Skip = skip)]
        public void UpdateEstimate_Ok()
        {
            //Arrange
            var tourney = CreateTourney();
            var match = tourney.Phases.First().Squads.First().Matches.First();
            Assert.Empty(match.Estimates);
            //Act
            _service.UpdateEstimate(UID, "", _context);
            //Assert
            var estimate = Assert.Single(match.Estimates);
            Assert.Equal(0, estimate.ScoreA);
            Assert.Equal(0, estimate.ScoreB);
        }

        [Fact(Skip = skip)]
        public void AfftectationTeams_Ok()
        {
            //Arrange
            var tourney = CreateTourney();
            var ranking = _service.GetRanking(UID, null, _context);
            var dto = _mapper.Map<RankingDto>(ranking);
            var team1 = dto.Tourney.Teams.Single(t => t.Name == TEAM1);
            var team2 = dto.Tourney.Teams.Single(t => t.Name == TEAM2);
            var match = dto.Tourney.Phases.First().Squads.First().Matches.First();

            Assert.Equal(0, match.TeamIdA);
            Assert.Equal(0, match.TeamIdB);
            //Act
            _service.AffectationTeams(dto);
            //Assert
            Assert.Equal(team1.Id, match.TeamIdA);
            Assert.Equal(team2.Id, match.TeamIdB);
            Assert.Equal([team1.Id, team2.Id], dto.Tourney.Ranks.Select(r => r.TeamId).ToList());

        }

        [Fact(Skip = skip)]
        public void CalculateHistory_Ok()
        {
            //Arrange
            var tourney = CreateTourney();
            var ranking = _service.GetRanking(UID, null, _context);
            var dto = _mapper.Map<RankingDto>(ranking);
            var team1 = dto.Tourney.Teams.Single(t => t.Name == TEAM1);
            var team2 = dto.Tourney.Teams.Single(t => t.Name == TEAM2);

            Assert.False(dto.History.ContainsKey(team1.Id));
            Assert.False(dto.History.ContainsKey(team2.Id));
            Assert.False(dto.Scores.ScoreTeams.ContainsKey(team1.Id));
            Assert.False(dto.Scores.ScoreTeams.ContainsKey(team2.Id));
            //Act
            _service.CalculateHistory(dto);
            //Assert
            Assert.True(dto.History.ContainsKey(team1.Id));
            Assert.True(dto.History.ContainsKey(team2.Id));
            Assert.True(dto.Scores.ScoreTeams.ContainsKey(team1.Id));
            Assert.True(dto.Scores.ScoreTeams.ContainsKey(team2.Id));
        }

        [Fact(Skip = skip)]
        public void SetConfig()
        {
            //Arrange
            CreateTourney();
            var ranking = _service.GetRanking(UID, null, _context);
            var dto = _mapper.Map<RankingDto>(ranking);

            Assert.Null(dto.Tourney.Config);
            //Act
            _service.SetConfig(dto);
            //Assert
            Assert.NotNull(dto.Tourney.Config);
        }

        [Fact(Skip = skip)]
        public void UpdateScore()
        {
            //Arrange
            var tourney = CreateTourney();
            var match = tourney.Phases.First().Squads.First().Matches.First();
            match.ScoreA = 1;
            var scoreA = new Score();
            var scoreB = new Score();
            //Act
            _service.UpdateScore(scoreA, scoreB, null, match, new ScoobyRule());
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

        [Fact(Skip = skip)]
        public void SaveMatch()
        {
            //Arrange
            var user = CreateUser();
            var tourney = CreateTourney();
            var match = tourney.Phases.First().Squads.First().Matches.First();
            var dto = _mapper.Map<MatchDto>(match);
            dto.ScoreA = 1;
            dto.ScoreB = 0;

            Assert.False(match.Done);
            Assert.Equal(0, match.ScoreA);
            Assert.Equal(0, match.ScoreB);
            //Act
            _service.SaveMatch(dto, user.Login, UID, _context);
            //Assert
            Assert.True(match.Done);
            Assert.Equal(1, match.ScoreA);
            Assert.Equal(0, match.ScoreB);
        }

        [Fact(Skip = skip)]
        public void ClearMatch()
        {
            //Arrange
            var user = CreateUser();
            var tourney = CreateTourney();
            var match = tourney.Phases.First().Squads.First().Matches.First();
            var dto = _mapper.Map<MatchDto>(match);
            dto.ScoreA = 1;
            dto.ScoreB = 0;

            //Act
            _service.SaveMatch(dto, user.Login, UID, _context);
            _service.ClearMatch(dto, user.Login, UID, _context);
            //Assert
            Assert.False(match.Done);
            Assert.Equal(0, match.ScoreA);
            Assert.Equal(0, match.ScoreB);

        }

        [Fact(Skip = skip)]
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

        [Fact(Skip = skip)]
        public void ClearSimulations()
        {
            //Arrange
            var tourney = CreateTourney();
            var user = CreateUser();
            var config = new UserConfigDto() { UseCustomEstimate = true };
            _service.SaveUserConfig(tourney.Uid, user.Login, config, _context);

            var match = tourney.Phases.First().Squads.First().Matches.First();
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

        [Fact(Skip = skip)]
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

        [Fact(Skip = skip)]
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

    }
}
