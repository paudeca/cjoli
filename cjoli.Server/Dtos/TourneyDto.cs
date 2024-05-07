﻿namespace cjoli.Server.Dtos
{
    public class TourneyDto
    {
        public int Id { get; set; }
        public string? Uid { get; set; }
        public string? Name { get; set; }
        public List<PhaseDto>? Phases { get; set; }
        public List<TeamDto>? Teams { get; set; }
        public List<RankDto>? Ranks { get; set; }


    }
}
