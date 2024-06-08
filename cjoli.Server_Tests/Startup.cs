using cjoli.Server.Dtos;
using cjoli.Server.Models;
using cjoli.Server.Services;
using cjoli.Server_Tests.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace cjoli.Server_Tests
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDataProtection();
            services.AddSingleton<CJoliService>();
            services.AddSingleton<EstimateService>();
            services.AddSingleton<UserService>();

            var fixture = new DatabaseFixture();

            services.AddDbContextPool<CJoliContext>(options =>
            {
                options.UseSqlite(fixture._connection);
            });
            services.AddAutoMapper(typeof(TourneyDto));

            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string> { { "JwtKey", "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" } })
                .Build();
            services.AddSingleton<IConfiguration>(config);


            var context = services.BuildServiceProvider().GetService<CJoliContext>();
            if (context == null)
            {
                throw new Exception("unable to create context");
            }
            context.Database.EnsureCreated();
        }

    }
}
