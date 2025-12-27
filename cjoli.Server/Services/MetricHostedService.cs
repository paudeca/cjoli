
using Microsoft.ApplicationInsights;

namespace cjoli.Server.Services
{
    public class MetricHostedService : BackgroundService
    {
        private readonly TelemetryClient _telemetryClient;
        private readonly ServerService _serverService;

        public MetricHostedService(TelemetryClient telemetryClient, ServerService serverService)
        {
            _telemetryClient = telemetryClient;
            _serverService = serverService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var metric = _telemetryClient.GetMetric("CJoli.LiveUser", "Tourney");
            while (!stoppingToken.IsCancellationRequested)
            {
                var map = _serverService.GetUsersByTourney;
                foreach (var kv in map)
                {
                    metric.TrackValue(kv.Value, kv.Key);
                }
                if (map.Count == 0)
                {
                    metric.TrackValue(0, "default");
                }
                await Task.Delay(60 * 1000, stoppingToken);
            }
        }
    }
}
