
using Microsoft.ApplicationInsights;

namespace cjoli.Server.Middlewares
{
    public class CancellationMiddleware : IMiddleware
    {

        private readonly TelemetryClient _telemetryClient;

        public CancellationMiddleware(TelemetryClient telemetryClient)
        {
            _telemetryClient = telemetryClient;
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            try
            {
                await next(context);
            }
            catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
            {
                var path = context.Request.Path.Value!;
                _telemetryClient.TrackEvent("CancellationRequest", new Dictionary<string, string> { { "Path", path } });
            }
        }
    }
}
