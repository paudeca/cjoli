using Azure;
using Azure.AI.OpenAI;
using cjoli.Server.Dtos;
using cjoli.Server.Models;
using cjoli.Server.Services;
using cjoli.Server_Tests.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;

namespace cjoli.Server_Tests
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDataProtection();
            //services.AddMemoryCache();
            services.AddSingleton<IMemoryCache, MemoryCache>();
            services.AddSingleton<CJoliService>();
            services.AddSingleton<EstimateService>();
            services.AddSingleton<UserService>();
            services.AddSingleton<SettingService>();
            services.AddSingleton<AIService>();
            services.AddSingleton<ServerService>();
            services.AddSingleton<StorageService>();
            services.AddSingleton<SynchroService>();

            var openAIClient = new Mock<OpenAIClient>();
            var response = new Mock<Response<ChatCompletions>>();
            openAIClient.Setup(x => x.GetChatCompletionsAsync(It.IsAny<ChatCompletionsOptions>(), CancellationToken.None)).ReturnsAsync(response.Object);
            services.AddSingleton(openAIClient.Object);
            services.AddSingleton(response);



            var fixture = new DatabaseFixture();

            services.AddDbContextPool<CJoliContext>(options =>
            {
                options.UseSqlite(fixture._connection);
            });
            services.AddAutoMapper(typeof(TourneyDto));

            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(initialData: [
                    KeyValuePair.Create<string, string?>("JwtKey", "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"),
                    KeyValuePair.Create<string, string?>("ConnectionStrings:AzureStorage", "UseDevelopmentStorage=true")
                 ])
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
