using cjoli.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace cjoli.Server.Data
{
    public class CJoliContext : DbContext
    {
        public DbSet<Tourney> Tourneys { get; set; }

        public CJoliContext(DbContextOptions<CJoliContext> options) : base(options) { }
    }
}
