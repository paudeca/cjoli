namespace cjoli.Server.Dtos
{
    public class UserDto
    {
        public int Id { get; set; }
        public required string Login { get; set; }
        public string? Password { get; set; }
    }
}
