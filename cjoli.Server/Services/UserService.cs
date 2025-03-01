using cjoli.Server.Dtos;
using cjoli.Server.Exceptions;
using cjoli.Server.Extensions;
using cjoli.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace cjoli.Server.Services
{
    public class UserService
    {
        private readonly IConfiguration _configuration;
        private readonly AIService _aiService;
        private readonly ILogger<UserService> _logger;
        public UserService(IConfiguration configuration, AIService aiService, ILogger<UserService> logger)
        {
            _configuration = configuration;
            _aiService = aiService;
            _logger = logger;
        }

        public User Register(UserDto userDto, CJoliContext context)
        {
            if (string.IsNullOrEmpty(userDto.Password))
            {
                throw new IllegalArgumentException("Password");
            }
            var invalidLogin = _aiService.CheckLogin(userDto.Login, context).Result;
            if(invalidLogin=="true")
            {
                throw new IllegalArgumentException("Login");
            }

            User? user = context.Users.SingleOrDefault(u => u.Login == userDto.Login);
            if (user != null)
            {
                throw new AlreadyException($"User with login:{userDto.Login} already exists");
            }
            var source = _configuration["Source"] ?? "prod";

            user = new User() { Login = userDto.Login, Password = userDto.Password, Source=source };
            context.Users.Add(user);
            context.SaveChanges();
            return user;
        }

        public User GetUser(string login, CJoliContext context)
        {
            User? user = context.Users.SingleOrDefault(u => u.Login == login);
            if (user == null)
            {
                throw new NotFoundException("User", login);
            }
            return user;
        }

        public User GetUserDetail(string login, CJoliContext context)
        {
            User? user = context.Users
                .Include(u => u.Configs).ThenInclude(c => c.Tourney)
                .Include(u => u.Configs).ThenInclude(c => c.FavoriteTeam)
                .SingleOrDefault(u => u.Login == login);
            if (user == null)
            {
                throw new NotFoundException("User", login);
            }
            return user;
        }

        public List<User> ListUsers(CJoliContext context)
        {
            var source = _configuration["Source"];
            return context.Users.Where(u => u.Role != "ADMIN" && u.Source==source).Include(u => u.Configs).ThenInclude(c => c.Tourney).ToList();
        }


        public bool Update(string login, string password, CJoliContext context)
        {
            User user = GetUser(login, context);
            user.Password = password;
            context.SaveChanges();
            return true;
        }

        public string Login(string login, string password, CJoliContext context)
        {
            User user = GetUserDetail(login, context);
            if (user.Password != password)
            {
                throw new InvalidLoginException(login);
            }
            var key = _configuration["JwtKey"];
            if (key == null)
            {
                throw new IllegalArgumentException("JwtKey not defined in configuration");
            }

            var claims = new List<Claim>()
            {
                    new Claim("Id", Guid.NewGuid().ToString()),
                    new Claim(JwtRegisteredClaimNames.Sub, login),
                    new Claim(JwtRegisteredClaimNames.Email, login),
                    new Claim(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.Role, user.Role ?? "AGENT"),
            };

            var adminTourneys = user.Configs.Where(c=>c.IsAdmin).Select(c => new Claim(ClaimTypes.Role,$"ADMIN_{c.Tourney.Uid}")).ToList();
            if(adminTourneys.Count>0)
            {
                claims.Add(new Claim(ClaimTypes.Role, "ADMIN_LOCAL"));
                claims.AddRange(adminTourneys);
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(1),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha512Signature)
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwtToken = tokenHandler.WriteToken(token);
            return jwtToken;

        }

        public void SaveUserConfig(Tourney tourney, User user, UserConfigDto dto, CJoliContext context)
        {
            UserConfig? config = user.Configs.SingleOrDefault(c => c.Id == dto.Id);
            if (config == null)
            {
                config = new UserConfig() { User = user, Tourney = tourney };
                user.Configs.Add(config);
            }
            config.UseCustomEstimate = dto.UseCustomEstimate;
            config.FavoriteTeam = dto.FavoriteTeamId > 0 ? tourney.Teams.Single(t => t.Id == dto.FavoriteTeamId) : null;
            context.SaveChanges();
        }

        public void SaveUserAdmins(int userId, int[] tourneys, CJoliContext context)
        {
            User? user = context.Users.Include(u=>u.Configs).SingleOrDefault(u => u.Id == userId);
            if (user == null)
            {
                throw new NotFoundException("User", userId);
            }
            user.Configs.ToList().ForEach(c =>
            {
                c.IsAdmin = false;
            });
            tourneys.ToList().ForEach(tourneyId =>
            {
                Tourney tourney = context.Tourneys.Single(t => t.Id == tourneyId);
                UserConfig? config = user.Configs.SingleOrDefault(c => c.Tourney == tourney);
                if(config == null)
                {
                    config = new UserConfig() { User = user, Tourney = tourney };
                    user.Configs.Add(config);
                }
                config.IsAdmin = true;
            });
            context.SaveChanges();
        }

    }
}
