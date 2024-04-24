using cjoli.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace cjoli.Server.Datas
{
    public class CJoliContext : DbContext
    {
        public DbSet<Tourney> Tourneys { get; set; }

        public CJoliContext(DbContextOptions<CJoliContext> options) : base(options) { }
    }
}
