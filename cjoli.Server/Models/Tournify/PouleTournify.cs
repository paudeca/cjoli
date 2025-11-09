using Google.Cloud.Firestore;

namespace cjoli.Server.Models.Tournify
{
    [FirestoreData]
    public class PouleTournify
    {
        [FirestoreProperty]
        public string? name { get; set; }
        [FirestoreProperty]
        public string? division { get; set; }
        [FirestoreProperty]
        public int fase { get; set; }
        [FirestoreProperty]
        public string? bracket { get; set; }
        [FirestoreProperty]
        public int num { get; set; }
        [FirestoreProperty]
        public int bracketRound { get; set; }

        public Squad? Squad { get; set; }

        public int GetTypeMatchNum()
        {
            return (int)Math.Log2(bracketRound);
        }
    }
}
