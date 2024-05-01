namespace cjoli.Server.Exceptions
{
    public class NotFoundException : Exception
    {
        public NotFoundException(string type, string uid) : base($"{type} with uid:{uid} not found") { }
        public NotFoundException(string type, int id) : base($"{type} with id:{id} not found") { }
    }
}
