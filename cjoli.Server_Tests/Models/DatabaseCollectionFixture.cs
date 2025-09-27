using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using cjoli.Server.Models;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.DependencyInjection;

namespace cjoli.Server_Tests.Models
{
    public class DatabaseCollectionFixture : IDisposable
    {
        public readonly SqliteConnection Connection;
        private readonly ServiceProvider _serviceProvider;

        public DatabaseCollectionFixture()
        {
            Connection = new SqliteConnection("DataSource=:memory:");
            Connection.Open();

            var services = new ServiceCollection();
            services.AddDataProtection();
            _serviceProvider = services.BuildServiceProvider();
            var dataProtectionProvider = _serviceProvider.GetRequiredService<IDataProtectionProvider>();

            using (var context = new CJoliContext(new DbContextOptionsBuilder<CJoliContext>().UseSqlite(Connection).Options, dataProtectionProvider))
            {
                context.Database.EnsureCreated();
                context.Database.Migrate();
            }
        }

        public void Dispose()
        {
            Connection.Close();
            Connection.Dispose();
            _serviceProvider.Dispose();
        }
    }
}