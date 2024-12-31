namespace cjoli.Server.Exceptions
{
    public class AuthorizationException : Exception
    {
        public AuthorizationException(string message) : base($"Invalid Authorization:{message}") { }
    }
}
