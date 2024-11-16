using Serilog.Context;

namespace cjoli.Server.Extensions
{
    public static class LoggerExtension
    {
        public static void LogInformationWithData(this ILogger logger, string message, object data)
        {
            using(LogContext.PushProperty("data",data,true))
            {
                logger.LogInformation(message);
            }
        }
    }
}
