namespace cjoli.Server.Dtos
{
    public class UserConfigDto
    {
        public int Id { get; set; }
        public int TourneyId { get; set; }

        public bool ActiveSimulation { get; set; }
        public bool UseCustomSimulation { get; set; }
    }
}
