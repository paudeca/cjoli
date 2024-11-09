using cjoli.Server.Models;

namespace cjoli.Server.Extensions
{
    public static class UserExtension
    {

        public static bool IsAdmin(this User? user)
        {
            return user?.Role == "ADMIN";
        }


        public static bool IsAdminWithNoCustomEstimate(this User? user)
        {
            var config = user?.Configs.FirstOrDefault();
            return user?.Role == "ADMIN" && (config == null || !config.UseCustomEstimate);
        }

        public static bool HasCustomEstimate(this User? user)
        {
            var config = user?.Configs.FirstOrDefault();
            return user != null && config != null && config.UseCustomEstimate;
        }
    }
}
