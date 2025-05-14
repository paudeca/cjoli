using Google.Cloud.Firestore;

namespace cjoli.Server.Models.Tournify
{
    [FirestoreData]
    public class FieldTournify
    {
        [FirestoreProperty]
        public string? name { get; set; }
    }
}
