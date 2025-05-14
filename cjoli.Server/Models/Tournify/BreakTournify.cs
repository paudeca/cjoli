using Google.Cloud.Firestore;

namespace cjoli.Server.Models.Tournify
{
    [FirestoreData]
    public class BreakTournify
    {
        [FirestoreProperty]
        public string? day { get; set; }
        [FirestoreProperty]
        public string? st { get; set; }
        [FirestoreProperty]
        public string? field { get; set; }
        [FirestoreProperty]
        public string? name { get; set; }
        [FirestoreProperty]
        public List<string>? teams { get; set; }
        [FirestoreProperty]
        public string? id { get; set; }

    }
}
