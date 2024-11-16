using Microsoft.AspNetCore.Diagnostics;

namespace cjoli.Server.Exceptions
{
    public class LoggerExceptionHandler : IExceptionHandler
    {
        private readonly ILogger _logger;
        public LoggerExceptionHandler(ILogger<LoggerExceptionHandler> logger) {
            _logger = logger;
        }

        public ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            _logger.LogError(exception, exception.Message);
            return ValueTask.FromResult(false);
        }
    }
}
