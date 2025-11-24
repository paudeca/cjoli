
using cjoli.Server.Models;
using cjoli.Server.Models.Tournify;
using Microsoft.Extensions.Caching.Memory;

namespace cjoli.Server.Services
{
    public class SynchroHostedService : BackgroundService
    {
        private readonly IServiceProvider _service;
        private readonly ILogger<SynchroHostedService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _memoryCache;
        private readonly ServerService _serverService;
        private readonly SynchroService _synchroService;

        private Dictionary<string, CancellationTokenSource> _threads = new Dictionary<string, CancellationTokenSource>();

        public SynchroHostedService(IServiceProvider service, ILogger<SynchroHostedService> logger, IConfiguration configuration, IMemoryCache memoryCache, ServerService serverService, SynchroService synchroService)
        {
            _service = service;
            _logger = logger;
            _configuration = configuration;
            _memoryCache = memoryCache;
            _serverService = serverService;
            _synchroService = synchroService;
        }


        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using var scope = _service.CreateScope();


            var context = scope.ServiceProvider.GetService<CJoliContext>()!;

            _threads = context.Tourneys.Where(t => t.Tournify != null && t.EndTime >= DateTime.Now).ToDictionary(t => t.Uid, t =>
            {
                CancellationTokenSource source = new CancellationTokenSource();
                var thread = CreateThread(t.Uid, source.Token);
                thread.Start();
                return source;
            });

            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(60 * 60 * 1000, stoppingToken);
            }

            return;

        }

        private Thread CreateThread(string uid, CancellationToken stoppingToken)
        {
            var thread = new Thread(new ThreadStart(async () =>
            {
                using var scope = _service.CreateScope();
                var session = new SessionTournify();

                var context = scope.ServiceProvider.GetService<CJoliContext>()!;

                await _synchroService.Synchro(uid, context, stoppingToken);

            }));
            return thread;
        }

    }
}
