
using Microsoft.ApplicationInsights;
using System.Text.Json;

namespace cjoli.Server.Services
{
    public class MetricHostedService : BackgroundService
    {
        private readonly ILogger<MetricHostedService> _logger;
        private readonly TelemetryClient _telemetryClient;
        private readonly ServerService _serverService;

        public MetricHostedService(ILogger<MetricHostedService> logger, TelemetryClient telemetryClient, ServerService serverService)
        {
            _logger = logger;
            _telemetryClient = telemetryClient;
            _serverService = serverService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var metric = _telemetryClient.GetMetric("CJoli.LiveUser", "Tourney");
            while (!stoppingToken.IsCancellationRequested)
            {
                var map = _serverService.GetUsersByTourney;
                _logger.LogInformation($"Current map:{JsonSerializer.Serialize(map)}");
                foreach (var kv in map)
                {
                    metric.TrackValue(kv.Value, kv.Key);
                }
                if (map.Count == 0)
                {
                    metric.TrackValue(0, "default");
                }
                await _telemetryClient.FlushAsync(stoppingToken);
                await Task.Delay(60 * 1000, stoppingToken);
            }
        }
    }
}
