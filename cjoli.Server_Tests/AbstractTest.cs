using cjoli.Server.Models;

namespace cjoli.Server_Tests
{
    public class AbstractTest
    {
        protected readonly CJoliContext _context;

        public AbstractTest(CJoliContext context)
        {
            _context = context;
        }

        protected Tourney CreateTourney()
        {
            var tourney = new Tourney() { Uid = "uid", Name = "name", Rule="simple321" };

            var phase = new Phase() { Name = "phase1", Tourney = tourney };
            tourney.Phases.Add(phase);

            var squad = new Squad() { Name = "squad1", Phase = phase };
            phase.Squads.Add(squad);


            var team1 = CreateTeam("team1", tourney);
            var team2 = CreateTeam("team2", tourney);

            CreateMatch(tourney, team1, team2);


            var phase2 = new Phase { Name = "phase2", Tourney = tourney };
            tourney.Phases.Add(phase2);
            var squad2 = new Squad { Name = "squad2", Phase = phase2 };
            phase2.Squads.Add(squad2);

            var parent1 = squad.Positions.First();
            var position1 = new Position { Name = "position2-1", ParentPosition = new ParentPosition { Position = parent1, Squad = squad, Value = 1 } };
            squad2.Positions.Add(position1);

            var parent2 = squad.Positions.Skip(1).First();
            var position2 = new Position { Name = "position2-2", ParentPosition = new ParentPosition { Position = parent2, Squad = squad, Value = 2 } };
            squad2.Positions.Add(position2);

            var match = new Match() { PositionA = position1, PositionB = position2 };
            squad2.Matches.Add(match);


            _context.Tourneys.Add(tourney);

            _context.SaveChanges();
            return tourney;
        }

        protected Team CreateTeam(string name, Tourney tourney)
        {
            var team = new Team() { Name = name };
            tourney.Teams.Add(team);

            var squad = tourney.Phases.First().Squads.First();
            var position = new Position() { Name = $"position-{name}", Team = team };
            squad.Positions.Add(position);

            int order = tourney.Ranks.Count + 1;
            tourney.Ranks.Add(new Rank() { Squad = squad, Tourney = tourney, Order = order, Value = order });
            _context.SaveChanges();
            return team;
        }

        protected Team Team(string name, Tourney tourney) => tourney.Teams.Single(t => t.Name == name);
        protected Squad Squad(string name, Tourney tourney) => tourney.Phases.SelectMany(p => p.Squads).Single(s => s.Name == name);
        protected Match Match(Tourney tourney, string squadName = "squad1") => Squad(squadName, tourney).Matches.First();
        protected Position Position(string name, Tourney tourney) => tourney.Phases.SelectMany(p => p.Squads).SelectMany(s => s.Positions).Single(p => p.Name == name);

        protected Match CreateMatch(Tourney tourney, Team team1, Team team2, Action<Match>? update = null)
        {
            var squad = tourney.Phases.First().Squads.First();
            var positions = squad.Positions.ToList();
            var position1 = squad.Positions.Single(p => p.Team == team1);
            var position2 = squad.Positions.Single(p => p.Team == team2);
            var match = new Match() { PositionA = position1, PositionB = position2 };
            if (update != null) update(match);
            squad.Matches.Add(match);
            _context.SaveChanges();
            return match;
        }

        protected User CreateUser(string role = "ADMIN")
        {
            var user = new User() { Login = $"login-{role}", Password = "", Role = role };
            _context.Users.Add(user);
            _context.SaveChanges();
            return user;
        }

    }
}
