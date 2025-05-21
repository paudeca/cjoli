using Google.Cloud.Firestore;

namespace cjoli.Server.Models.Tournify
{
    [FirestoreData]
    public class TieBreakerTournify
    {
        [FirestoreProperty]
        public string? id { get; set; }
        [FirestoreProperty]
        public bool? applyRecursively { get; set; }
        [FirestoreProperty]
        public List<TieBreakerTournify>? subCriteria { get; set; }
    }
}
