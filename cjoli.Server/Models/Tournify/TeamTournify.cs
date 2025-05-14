using Google.Cloud.Firestore;

namespace cjoli.Server.Models.Tournify
{
    [FirestoreData]
    public class TeamTournify
    {
        [FirestoreProperty]
        public string? name { get; set; }
        [FirestoreProperty]
        public int numInPoule0 { get; set; }
        [FirestoreProperty]
        public string? poule0 { get; set; }

    }
}
