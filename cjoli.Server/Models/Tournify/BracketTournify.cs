using Google.Cloud.Firestore;

namespace cjoli.Server.Models.Tournify
{
    [FirestoreData]
    public class BracketTournify
    {
        [FirestoreProperty]
        public string? name { get; set; }
        [FirestoreProperty]
        public string? division { get; set; }
        [FirestoreProperty]
        public int fase { get; set; }
        [FirestoreProperty]
        public string? subBracketTo { get; set; }
        [FirestoreProperty]
        public int num { get; set; }
        [FirestoreProperty]
        public int size { get; set; }

        public int GetTypeMatchNum()
        {
            return (int)Math.Log2(size);
        }

        public int GetOrder(PouleTournify poule)
        {
            return GetTypeMatchNum() - poule.GetTypeMatchNum();
        }

    }
}
