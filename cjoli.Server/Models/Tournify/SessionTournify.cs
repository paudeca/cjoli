using Google.Cloud.Firestore;
using System.Linq.Expressions;

namespace cjoli.Server.Models.Tournify
{
    public class SessionTournify
    {

        public string? Id { get; set; }
        public List<FirestoreChangeListener> Listeners { get; set; } = new List<FirestoreChangeListener>();
        public Dictionary<string, Team> Teams { get; set; } = new Dictionary<string, Team>();
        public SemaphoreSlim Lock { get; set; } = new SemaphoreSlim(1, 1);
        public Dictionary<string, string> Brackets { get; set; } = new Dictionary<string, string>();
    }
}
