using cjoli.Server.Dtos;
using cjoli.Server.Models;
using cjoli.Server.Services;
using cjoli.Server_Tests.Models;
using Microsoft.EntityFrameworkCore;
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

            var fixture = new DatabaseFixture();

            services.AddDbContextPool<CJoliContext>(options =>
            {
                options.UseSqlite(fixture._connection);
            });
            services.AddAutoMapper(typeof(TourneyDto));


            var context = services.BuildServiceProvider().GetService<CJoliContext>();
            if (context == null)
            {
                throw new Exception("unable to create context");
            }
            context.Database.EnsureCreated();
            //InitData(context!);
        }

        private void InitData(CJoliContext context)
        {
            var tourney = new Tourney() { Uid = "uid", Name = "mytourney" };
            context.Tourneys.Add(tourney);

            context.SaveChanges();
        }

    }
}
