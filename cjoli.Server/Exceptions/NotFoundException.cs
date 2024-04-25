namespace cjoli.Server.Exceptions
{
    public class NotFoundException : Exception
    {
        public NotFoundException(string type, string uid) : base($"{type} with uid:{uid} not found") { }
    }
}
