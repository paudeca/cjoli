﻿namespace cjoli.Server.Dtos
{
    public class SquadDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public List<PositionDto> Positions { get; set; } = new List<PositionDto>();
        public List<MatchDto> Matches { get; set; } = new List<MatchDto>();
        public List<int>? TeamId { get; set; }
        public string? Tournify { get; set; }
        public int Order { get; set; }

    }
}
