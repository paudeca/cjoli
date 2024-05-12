﻿
using cjoli.Server.Models;

namespace cjoli.Server.Services.Rules
{
    public interface IRule
    {
        int Win { get; }
        int Neutral { get; }
        int Loss { get; }
        int Forfeit { get; }

        Dictionary<int, Score> InitScoreSquad(Squad squad, List<ScoreSquad> scoreSquads);
    }
}
