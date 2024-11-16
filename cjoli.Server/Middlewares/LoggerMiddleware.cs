
using Serilog.Context;
using System.Security.Claims;

namespace cjoli.Server.Middlewares
{
    public class LoggerMiddleware : IMiddleware
    {
        private string? GetLogin(HttpContext context)
        {
            var user = context.User;
            if (user.Identity == null || !user.Identity.IsAuthenticated)
            {
                return null;
            }
            return user.Claims.First(i => i.Type == ClaimTypes.NameIdentifier).Value;
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            using (LogContext.PushProperty("user", GetLogin(context)??"guest"))
            {
                await next(context);
            }
        }
    }
}
