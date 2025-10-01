using Google.Cloud.Firestore;

namespace cjoli.Server.Models.Tournify
{
    [FirestoreData]
    public class SpotTournify
    {
        [FirestoreProperty]
        public int fase { get; set; }
        [FirestoreProperty]
        public string? fromPoule { get; set; }
        [FirestoreProperty]
        public int rank { get; set; }
        [FirestoreProperty]
        public string? belongsToBracket { get; set; }
        [FirestoreProperty]
        public int bracketRound { get; set; }
        [FirestoreProperty]
        public int fromPouleNum { get; set; }

        public Dictionary<string, int> poules = new Dictionary<string, int>();
        public Position? Position { get; set; }
    }
}
