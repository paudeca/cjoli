using Google.Cloud.Firestore;

namespace cjoli.Server.Models.Tournify
{
    [FirestoreData]
    public class TourneyTournify
    {
        [FirestoreProperty]
        public string? name { get; set; }
        [FirestoreProperty]
        public int date { get; set; }
        [FirestoreProperty]
        public Dictionary<string, FieldTournify>? fields { get; set; }
        [FirestoreProperty]
        public Dictionary<string, BreakTournify>? breaks { get; set; }

        [FirestoreProperty]
        public string? pointsWin { get; set; }
        [FirestoreProperty]
        public string? pointsLoss { get; set; }
        [FirestoreProperty]
        public string? pointsTie { get; set; }

        [FirestoreProperty]
        public List<TieBreakerTournify>? tiebreakers { get; set; }


    }
}
