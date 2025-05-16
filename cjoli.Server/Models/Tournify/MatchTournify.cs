using Google.Cloud.Firestore;

namespace cjoli.Server.Models.Tournify
{
    [FirestoreData]
    public class MatchTournify
    {
        [FirestoreProperty]
        public string? bracket { get; set; }
        [FirestoreProperty]
        public string? poule { get; set; }
        [FirestoreProperty]
        public string? day { get; set; }
        [FirestoreProperty]
        public string? st { get; set; }
        [FirestoreProperty]
        public string? et { get; set; }
        [FirestoreProperty]
        public int? score1 { get; set; }
        [FirestoreProperty]
        public int? score2 { get; set; }
        [FirestoreProperty]
        public int team1 { get; set; }
        [FirestoreProperty]
        public int team2 { get; set; }
        [FirestoreProperty]
        public string? field { get; set; }



    }
}
