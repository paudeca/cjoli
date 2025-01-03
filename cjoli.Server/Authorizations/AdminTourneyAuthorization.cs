using cjoli.Server.Dtos;
using cjoli.Server.Exceptions;
using Microsoft.AspNetCore.Authorization;

namespace cjoli.Server.Authorizations
{
    public class AdminTourneyAuthorizationHandler : AuthorizationHandler<AdminTourneyRequirement, string>
    {
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, AdminTourneyRequirement requirement, string resource)
        {
            string role = $"ADMIN_{resource}";
            if (context.User.IsInRole(role) || context.User.IsInRole("ADMIN"))
            {
                context.Succeed(requirement);
            } else
            {
                throw new AuthorizationException($"Role:{role} not found");
            }
            return Task.CompletedTask;
        }
    }

    public class AdminTourneyRequirement : IAuthorizationRequirement { }
}
