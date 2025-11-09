using Google.Cloud.Firestore;
using System.Linq.Expressions;

namespace cjoli.Server.Models.Tournify
{
    public class SessionTournify
    {

        public string? Id { get; set; }
        public List<FirestoreChangeListener> Listeners { get; set; } = new List<FirestoreChangeListener>();
        public Dictionary<string, Team> Teams { get; set; } = new Dictionary<string, Team>();
        public Dictionary<string, BracketTournify> Brackets = new Dictionary<string, BracketTournify>();
        public SemaphoreSlim Lock { get; set; } = new SemaphoreSlim(1, 1);

        public string? GetRootBracket(string bracketId)
        {
            var bracket = Brackets[bracketId];
            if (bracket.subBracketTo == null)
            {
                return bracketId;
            }
            else if (Brackets.ContainsKey(bracket.subBracketTo))
            {
                return GetRootBracket(bracket.subBracketTo);
            }
            else
            {
                return null;
            }
        }

    }
}
