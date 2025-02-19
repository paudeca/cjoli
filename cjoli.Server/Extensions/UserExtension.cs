using cjoli.Server.Models;

namespace cjoli.Server.Extensions
{
    public static class UserExtension
    {

        public static bool IsAdmin(this User? user, string uid)
        {
            var config = user?.Configs.FirstOrDefault(c=>c.Tourney.Uid==uid);
            return user?.Role == "ADMIN" || (config!=null && config.IsAdmin);
        }


        public static bool IsAdminWithNoCustomEstimate(this User? user, string uid)
        {
            var config = user?.Configs.FirstOrDefault(c=>c.Tourney.Uid==uid);
            return (user!=null && user.IsAdmin(uid)) && (config == null || !config.UseCustomEstimate);
        }

        public static bool HasCustomEstimate(this User? user)
        {
            var config = user?.Configs.FirstOrDefault();
            return user != null && config != null && config.UseCustomEstimate;
        }
    }
}
