namespace cjoli.Server.Dtos
{
    public class UserConfigDto
    {
        public int Id { get; set; }
        public int TourneyId { get; set; }

        public bool UseCustomEstimate { get; set; }
        public int FavoriteTeamId { get; set; }
        public bool IsAdmin { get; set; }
    }
}
