namespace cjoli.Server.Dtos
{
    public class TeamPlayerDto
    {
        public int Id { get; set; }
        public int Number { get; set; }
        public bool IsGoalKeeper { get; set; }
        public bool IsCaptain { get; set; }
        public bool IsAssistant { get; set; }

        public string? Name { get; set; }
        public int PlayerId { get; set; }

        public int Total { get; set; }
        public int Goal { get; set; }
        public int Assist { get; set; }
        public int Penalty { get; set; }

    }
}
