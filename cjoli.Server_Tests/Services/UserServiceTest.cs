using cjoli.Server.Dtos;
using cjoli.Server.Exceptions;
using cjoli.Server.Models;
using cjoli.Server.Services;
using Microsoft.EntityFrameworkCore.Storage;

namespace cjoli.Server_Tests.Services
{
    [Collection("CJoli")]
    public class UserServiceTest : IDisposable
    {
        private readonly UserService _service;
        private readonly CJoliContext _context;
        private readonly IDbContextTransaction _transaction;

        public UserServiceTest(UserService service, CJoliContext context)
        {
            _service = service;
            _context = context;
            _transaction = _context.Database.BeginTransaction();
        }

        public void Dispose()
        {
            _transaction.Rollback();
        }

        private User CreateUser()
        {
            var dto = new UserDto() { Login = "login", Password = "password" };
            return _service.Register(dto, _context);
        }

        [Fact]
        public void Register()
        {
            //Arrange
            var dto = new UserDto() { Login = "login", Password = "password" };
            //Act
            var user = _service.Register(dto, _context);
            //Assert
            Assert.NotNull(user);
            Assert.Equal("login", user.Login);
        }

        [Fact]
        public void Register_NoPassword()
        {
            //Arrange
            var dto = new UserDto() { Login = "login" };
            //Act
            //Assert
            Assert.Throws<IllegalArgumentException>(() => _service.Register(dto, _context));
        }

        [Fact]
        public void Register_Already()
        {
            //Arrange
            var dto = new UserDto() { Login = "login", Password = "password" };
            _service.Register(dto, _context);
            //Act
            //Assert
            Assert.Throws<AlreadyException>(() => _service.Register(dto, _context));
        }

        [Fact]
        public void GetUserDetail()
        {
            //Arrange
            var user = CreateUser();
            //Act
            var u = _service.GetUserDetail(user.Login, _context);
            //Assert
            Assert.Equal(user.Login, u.Login);
        }

        [Fact]
        public void GetUserDetail_NotFound()
        {
            //Arrange
            //Act
            //Assert
            Assert.Throws<NotFoundException>(() => _service.GetUserDetail("", _context));
        }

        [Fact]
        public void Update()
        {
            //Arrange
            var user = CreateUser();
            //Act
            var result = _service.Update(user.Login, "new", _context);
            //Assert
            Assert.True(result);
        }

        [Fact]
        public void Login()
        {
            //Arrange
            var user = CreateUser();
            //Act
            var token = _service.Login(user.Login, user.Password, _context);
            //Assert
            Assert.NotNull(token);
        }

    }
}
