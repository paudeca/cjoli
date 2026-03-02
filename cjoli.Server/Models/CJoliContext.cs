using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace cjoli.Server.Models
{
    public class CJoliContext : DbContext
    {
        public DbSet<Tourney> Tourneys { get; set; }
        public DbSet<Team> Team { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Squad> Squad { get; set; }
        public DbSet<Match> Match { get; set; }
        public DbSet<MatchEvent> MatchEvent { get; set; }
        public DbSet<MatchResult> MatchResult { get; set; }
        public DbSet<UserMatch> UserMatch { get; set; }
        public DbSet<MatchEstimate> MatchEstimate { get; set; }
        public DbSet<Position> Position { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Event> Event { get; set; }

        private const string CRYPT_PURPOSE = "CJoliCryptPurpose";

        public CJoliContext(DbContextOptions<CJoliContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Tourney>().HasIndex(t => t.Uid).IsUnique();
            modelBuilder.Entity<Tourney>().HasMany(t => t.Phases).WithOne(p => p.Tourney).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Tourney>().HasMany(t => t.Teams).WithMany(t => t.Tourneys);

            modelBuilder.Entity<TourneyTeamPlayer>().Property(t => t.IsCaptain).HasDefaultValue(false);
            modelBuilder.Entity<TourneyTeamPlayer>().Property(t => t.IsAssistant).HasDefaultValue(false);
            modelBuilder.Entity<TourneyTeamPlayer>().Property(t => t.IsGoalKeeper).HasDefaultValue(false);


            modelBuilder.Entity<Phase>().HasMany(p => p.Squads).WithOne(s => s.Phase).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Phase>().HasMany(p => p.ParentPositions).WithOne(p => p.Phase).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Squad>().HasMany(s => s.Positions).WithOne(p => p.Squad).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Squad>().HasMany(s => s.Matches).WithOne(m => m.Squad).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Squad>().HasMany(s => s.ParentPositions).WithOne(p => p.Squad).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Position>().HasOne(p => p.ParentPosition).WithOne(p => p.Position).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ParentPosition>().HasOne(p => p.Position).WithOne(p => p.ParentPosition).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Match>().HasMany(m => m.UserMatches).WithOne(u => u.Match).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Match>().HasMany(m => m.MatchResults).WithOne(m => m.Match).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Match>().HasMany(m => m.Estimates).WithOne(e => e.Match).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Match>().HasMany(m => m.Events).WithOne(e => e.Match).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Match>().Property(m => m.MatchType).HasDefaultValue(MatchType.Normal);

            modelBuilder.Entity<MatchEvent>().Property(m => m.Type).HasDefaultValue(MatchEventType.Start);


            modelBuilder.Entity<MatchEstimate>().HasOne(s => s.Match).WithMany(m => m.Estimates);

            modelBuilder.Entity<Team>().HasMany(t => t.Positions).WithOne(p => p.Team).OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<Team>().HasMany(t => t.MatchResults).WithOne(m => m.Team).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Team>().HasOne(t => t.Alias).WithMany(t => t.Children).OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<Team>().HasMany(t => t.UserConfigs).WithOne(c => c.FavoriteTeam).OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<Team>().HasMany(t => t.Players).WithOne(t => t.Team).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TeamData>().HasMany(t => t.Players).WithOne(t => t.Tourney).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Player>().HasMany(p => p.Teams).WithOne(t => t.Player).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PlayerTeam>().HasMany(p => p.Tourneys).WithOne(t => t.Player).OnDelete(DeleteBehavior.Cascade);

            var provider = Database.GetService<IDataProtectionProvider>();

            modelBuilder.Entity<User>().Property(u => u.Password).HasConversion(u => provider.CreateProtector(CRYPT_PURPOSE).Protect(u), u => provider.CreateProtector(CRYPT_PURPOSE).Unprotect(u));
            modelBuilder.Entity<User>().HasIndex(t => t.Login).IsUnique();
            modelBuilder.Entity<User>().HasMany(u => u.UserMatches).WithOne(u => u.User).OnDelete(DeleteBehavior.Cascade);

        }

    }
}
