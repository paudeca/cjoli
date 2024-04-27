namespace cjoli.Server.Exceptions
{
    public class InvalidLoginException : Exception
    {
        public InvalidLoginException(string login) : base($"Invalid login with {login}") { }
    }
}
