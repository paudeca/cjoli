
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;

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
                using (_telemetryClient.StartOperation<RequestTelemetry>("liveUser"))
                {
                    foreach (var kv in _serverService.GetUsersByTourney)
                    {
                        metric.TrackValue(kv.Value, kv.Key);
                    }
                    await Task.Delay(60 * 1000, stoppingToken);
                }
            }
        }
    }
}
