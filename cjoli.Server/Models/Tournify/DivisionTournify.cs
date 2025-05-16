using Google.Cloud.Firestore;

namespace cjoli.Server.Models.Tournify
{
    [FirestoreData]
    public class DivisionTournify
    {
        [FirestoreProperty]
        public string? name { get; set; }

        [FirestoreProperty]
        public List<FaseTournify> fases { get; set; } = new List<FaseTournify>();
    }
}
