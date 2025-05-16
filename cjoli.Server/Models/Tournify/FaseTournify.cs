using Google.Cloud.Firestore;

namespace cjoli.Server.Models.Tournify
{
    [FirestoreData]
    public class FaseTournify
    {
        [FirestoreProperty]
        public string? name { get; set; }

        public DateTime MinTime { get; set; }
        public DateTime MaxTime { get; set; }
        public Phase? Phase { get; set; }
    }
}
