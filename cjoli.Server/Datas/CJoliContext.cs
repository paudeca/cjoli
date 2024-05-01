using cjoli.Server.Models;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace cjoli.Server.Datas
{
    public class CJoliContext : DbContext
    {
        public DbSet<Tourney> Tourneys { get; set; }
        public DbSet<User> Users { get; set; }

        private const string CRYPT_PURPOSE = "CJoliCryptPurpose";

        public CJoliContext(DbContextOptions<CJoliContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Tourney>().HasIndex(t => t.Uid).IsUnique();
            modelBuilder.Entity<Tourney>().HasMany(t => t.Phases).WithOne(p => p.Tourney).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Tourney>().HasMany(t => t.Teams).WithOne(t => t.Tourney).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Tourney>().HasMany(t => t.Users).WithMany(u => u.Tourneys);

            modelBuilder.Entity<Phase>().HasMany(p => p.Squads).WithOne(s => s.Phase).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Squad>().HasMany(s => s.Positions).WithOne(p => p.Squad).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Squad>().HasMany(s => s.Matches).WithOne(m => m.Squad).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Squad>().HasMany(s => s.ParentPositions).WithOne(p => p.Squad).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Position>().HasOne(p => p.ParentPosition).WithOne(p => p.Position).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ParentPosition>().HasOne(p => p.Position).WithOne(p => p.ParentPosition).OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Team>().HasMany(t => t.Positions).WithOne(p => p.Team).OnDelete(DeleteBehavior.SetNull);

            var provider = Database.GetService<IDataProtectionProvider>();
            modelBuilder.Entity<User>().Property(u => u.Password).HasConversion(u => provider.CreateProtector(CRYPT_PURPOSE).Protect(u), u => provider.CreateProtector(CRYPT_PURPOSE).Unprotect(u));
            modelBuilder.Entity<User>().HasIndex(t => t.Login).IsUnique();
        }

    }
}
