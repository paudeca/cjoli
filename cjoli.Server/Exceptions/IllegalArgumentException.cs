namespace cjoli.Server.Exceptions
{
    public class IllegalArgumentException : Exception
    {
        public IllegalArgumentException(string field) : base($"Invalid argument. {field} is needed") { }
    }
}
