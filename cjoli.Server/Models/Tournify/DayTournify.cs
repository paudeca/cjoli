using Google.Cloud.Firestore;

namespace cjoli.Server.Models.Tournify
{
    [FirestoreData]
    public class DayTournify
    {
        [FirestoreProperty]
        public int date { get; set; }
    }
}
