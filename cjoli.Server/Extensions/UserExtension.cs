using cjoli.Server.Models;

namespace cjoli.Server.Extensions
{
    public static class UserExtension
    {
        public static bool IsAdmin(this User? user)
        {
            return user?.Role == "ADMIN" && !user.Configs.First().UseCustomEstimate;
        }

        public static bool HasCustomEstimate(this User? user)
        {
            return user!=null && user.Configs.First().UseCustomEstimate;
        }
    }
}
