using cjoli.Server.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace cjoli.Server_Tests.Models
{
    internal class DatabaseFixture : IDisposable
    {
        public readonly SqliteConnection _connection;
        public DatabaseFixture()
        {
            _connection = new SqliteConnection("Filename=:memory:");
            _connection.Open();
        }

        public void Dispose() => _connection.Dispose();

        public CJoliContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<CJoliContext>().UseSqlite(_connection).Options;
            var result = new CJoliContext(options);
            result.Database.EnsureCreated();
            return result;
        }
    }
}
