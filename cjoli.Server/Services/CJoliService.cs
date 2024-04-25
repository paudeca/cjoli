using cjoli.Server.Datas;
using cjoli.Server.Exceptions;
using cjoli.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace cjoli.Server.Services
{
    public class CJoliService
    {

        public Tourney GetRanking(string tourneyUid, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Positions).ThenInclude(p => p.Team)
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Matches)
                .Include(t => t.Teams)
                .FirstOrDefault(t => t.Uid == tourneyUid);
            if (tourney == null)
            {
                throw new NotFoundException("Tourney", tourneyUid);
            }
            return tourney;
        }

    }
}
