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
            var trace = exception.StackTrace;
            var message = exception.Message;
            _logger.LogError("An unhandled exception has occurred: {errorMessage} Stack: {stackTrace}", message, trace);
            return ValueTask.FromResult(true);
        }
    }
}
