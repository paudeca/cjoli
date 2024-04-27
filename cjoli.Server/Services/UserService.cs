using cjoli.Server.Datas;
using cjoli.Server.Dtos;
using cjoli.Server.Exceptions;
using cjoli.Server.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace cjoli.Server.Services
{
    public class UserService
    {
        private readonly IConfiguration _configuration;
        public UserService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public User Register(UserDto userDto, CJoliContext context)
        {
            if (string.IsNullOrEmpty(userDto.Password))
            {
                throw new IllegalArgumentException("Password");
            }
            User? user = context.Users.SingleOrDefault(u => u.Login == userDto.Login);
            if (user != null)
            {
                throw new AlreadyException($"User with login:{userDto.Login} already exists");
            }
            user = new User() { Login = userDto.Login, Password = userDto.Password };
            context.Users.Add(user);
            context.SaveChanges();
            return user;
        }

        public string Login(string login, string password, CJoliContext context)
        {
            User? user = context.Users.SingleOrDefault(u => u.Login == login);
            if (user == null)
            {
                throw new NotFoundException("User", login);
            }
            if (user.Password != password)
            {
                throw new InvalidLoginException(login);
            }
            var key = _configuration["Jwt:Key"];
            if (key == null)
            {
                throw new IllegalArgumentException("Jwt:Key not defined in configuration");
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("Id", Guid.NewGuid().ToString()),
                    new Claim(JwtRegisteredClaimNames.Sub, login),
                    new Claim(JwtRegisteredClaimNames.Email, login),
                    new Claim(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString())
                }),
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
    }
}
