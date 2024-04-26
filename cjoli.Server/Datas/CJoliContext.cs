using cjoli.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace cjoli.Server.Datas
{
    public class CJoliContext : DbContext
    {
        public DbSet<Tourney> Tourneys { get; set; }

        public CJoliContext(DbContextOptions<CJoliContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Tourney>().HasIndex(t => t.Uid).IsUnique();
            modelBuilder.Entity<Tourney>().HasMany(t => t.Phases).WithOne(p => p.Tourney).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Tourney>().HasMany(t => t.Teams).WithOne(t => t.Tourney).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Phase>().HasMany(p => p.Squads).WithOne(s => s.Phase).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Squad>().HasMany(s => s.Positions).WithOne(p => p.Squad).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Squad>().HasMany(s => s.Matches).WithOne(m => m.Squad).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Team>().HasMany(t => t.Positions).WithOne(p => p.Team).OnDelete(DeleteBehavior.SetNull);
        }

    }
}
