namespace cjoli.Server.Dtos
{
    public class PositionDto
    {
        public int Id { get; set; }
        public int Value { get; set; }
        public string? Name { get; set; }
        public string? Short { get; set; }
        public int Penalty { get; set; }
        public int TeamId { get; set; }
        public int SquadId { get; set; }
        public ParentPositionDto? ParentPosition { get; set; }

    }

}