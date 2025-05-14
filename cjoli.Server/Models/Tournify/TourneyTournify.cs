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

    }
}
