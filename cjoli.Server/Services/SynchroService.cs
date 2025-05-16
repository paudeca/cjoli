using cjoli.Server.Models;
using Google.Cloud.Firestore.V1;
using Google.Cloud.Firestore;
using cjoli.Server.Dtos;
using Microsoft.EntityFrameworkCore;
using cjoli.Server.Models.Tournify;
using Microsoft.Extensions.Caching.Memory;
using AutoMapper;
using Google.Type;
using System.Text.RegularExpressions;

namespace cjoli.Server.Services
{
    public class SynchroService
    {

        private SettingService _settingService;
        private readonly IMemoryCache _memoryCache;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;

        public SynchroService(SettingService settingService, IMemoryCache memoryCache, IConfiguration configuration, IMapper mapper)
        {
            _settingService = settingService;
            _memoryCache = memoryCache;
            _configuration = configuration;
            _mapper = mapper;
        }

        private FirestoreDb CreateDb()
        {
            var builder = new FirestoreClientBuilder();
            builder.ApiKey = _configuration["FirebaseApiKey"];
            FirestoreClient client = builder.Build();

            FirestoreDb db = FirestoreDb.Create(_configuration["FirebaseProject"], client);
            return db;
        }

        public async Task<Tourney> Synchro(string uid, CJoliContext context)
        {
            var tourney = context.Tourneys
                    .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Positions).ThenInclude(p => p.ParentPosition)
                    .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Matches)
                    .Include(t => t.Phases).ThenInclude(p => p.Events).ThenInclude(e => e.Positions)
                    .Include(t => t.Teams).ThenInclude(t => t.TeamDatas.Where(t => t.Tourney.Uid == uid))
                    .Include(t => t.Ranks)
                    .Single(t => t.Uid == uid);

            if (string.IsNullOrEmpty(tourney.Tournify))
            {
                return tourney;
            }

            FirestoreDb db = CreateDb();

            var query = db.Collection("tournaments").WhereEqualTo("liveLink", tourney.Tournify);
            QuerySnapshot querySnapshot = await query.GetSnapshotAsync();
            var docTourney = querySnapshot.Documents.First();
            string id = docTourney.Id;
            TourneyTournify tourneyTournify = docTourney.ConvertTo<TourneyTournify>();

            tourney.Name = tourney.HasTournifySynchroName ? tourneyTournify.name ?? tourney.Name : tourney.Name;
            tourney.StartTime = DateTimeOffset.FromUnixTimeSeconds(tourneyTournify.date).ToLocalTime().DateTime;
            tourney.EndTime = tourney.StartTime.AddDays(1);

            var doc = db.Collection("tournaments").Document(id);

            query = doc.Collection("teams");
            querySnapshot = await query.GetSnapshotAsync();
            var mapTeams = querySnapshot.ToDictionary(t => t.Id, t => t.ConvertTo<TeamTournify>());

            var teams = new Dictionary<string, Team>();

            mapTeams.Keys.ToList().ForEach(id =>
            {
                var teamTournify = mapTeams[id]!;
                var team = context.Team.Include(t => t.TeamDatas.Where(t => t.Tourney.Uid == uid))
                    .SingleOrDefault(t => t.Name.ToLower() == teamTournify.name!.ToLower() || t.TeamDatas.SingleOrDefault(d => d.Tournify == id) != null);
                if (team == null)
                {
                    team = new Team() { Name = teamTournify.name! };
                    context.Team.Add(team);
                }
                var data = team.TeamDatas.SingleOrDefault(d => d.Tournify == id);
                if (data == null)
                {
                    data = new TeamData() { Team = team, Tourney = tourney };
                    team.TeamDatas.Add(data);
                }
                data.Tournify = id;
                if (!tourney.Teams.Contains(team))
                {
                    tourney.Teams.Add(team);
                }
                teams.Add(id, team);
            });

            query = doc.Collection("divisions");
            querySnapshot = await query.GetSnapshotAsync();
            var division = querySnapshot.First().ConvertTo<DivisionTournify>();

            int i = 0;
            var phases = tourney.Phases;
            division.fases.ForEach(f =>
            {
                Phase phase;
                if (phases.Count > i)
                {
                    phase = phases[i];
                    phase.Name = tourney.HasTournifySynchroName ? f.name! : phase.Name;
                }
                else
                {
                    phase = new Phase() { Name = f.name!, Tourney = tourney };
                    tourney.Phases.Add(phase);
                }
                f.MinTime = System.DateTime.MaxValue;
                f.MaxTime = System.DateTime.MinValue;
                f.Phase = phase;

                i++;
            });

            query = doc.Collection("poules");
            querySnapshot = await query.GetSnapshotAsync();
            var mapPoules = querySnapshot.ToDictionary(p => p.Id, p => p.ConvertTo<PouleTournify>());

            mapPoules.Keys.ToList().ForEach(id =>
            {
                var poule = mapPoules[id]!;
                var phase = tourney.Phases[poule.fase];
                var squad = phase.Squads.SingleOrDefault(s => s.Name.ToLower() == poule.name!.ToLower() || s.Tournify == id);
                if (squad == null)
                {
                    squad = new Squad() { Name = poule.name!, Phase = phase };
                    phase.Squads.Add(squad);
                }
                squad.Name = tourney.HasTournifySynchroName ? poule.name! : squad.Name;
                squad.Tournify = id;
                squad.Order = poule.num;
                poule.Squad = squad;

            });

            query = doc.Collection("resultSpots");
            querySnapshot = await query.GetSnapshotAsync();
            var mapSpot = querySnapshot.ToDictionary(p => p.Id, p => p.ConvertTo<SpotTournify>());
            var dicoSpots = querySnapshot.ToDictionary(p => p.Id, p => p.ToDictionary());
            var squads = tourney.Phases.SelectMany(p => p.Squads);
            var map = new Dictionary<string, List<(long, SpotTournify)>>();
            mapSpot.Keys.ToList().ForEach(id =>
            {
                var spot = mapSpot[id]!;

                var dico = dicoSpots[id]!;
                for (int i = 1; i < 10; i++)
                {
                    if (dico.ContainsKey($"poule{i}") && dico[$"poule{i}"] != null)
                    {
                        string poule = (string)dico[$"poule{i}"];
                        long num = (long)dico[$"numInPoule{i}"];
                        List<(long, SpotTournify)> list;
                        map.TryGetValue(poule, out list);
                        if (list == null)
                        {
                            list = new List<(long, SpotTournify)>();
                            map[poule] = list;
                        }
                        list.Add((num, spot));
                    }
                }
                var squad = squads.Single(s => s.Tournify == spot.fromPoule);
                var position = squad.Positions.SingleOrDefault(p => p.Value == spot.rank + 1);
                if (position == null)
                {
                    position = new Position() { Value = spot.rank + 1 };
                    squad.Positions.Add(position);
                }
                var kvTeam = mapTeams.Where(kv => kv.Value.poule0 == spot.fromPoule && kv.Value.numInPoule0 == spot.rank).SingleOrDefault();
                if (kvTeam.Key != null)
                {
                    var team = teams[kvTeam.Key];
                    position.Team = team;
                }
                spot.Position = position;
            });
            context.SaveChanges();
            mapSpot.Keys.ToList().ForEach(id =>
            {
                var spot = mapSpot[id]!;
                if (map.ContainsKey(spot.fromPoule!))
                {
                    List<(long, SpotTournify)> list = map[spot.fromPoule!];
                    var parentSpot = list.Single(p => p.Item1 == spot.rank).Item2;
                    var parentPosition = parentSpot.Position!;
                    var position = spot.Position!;
                    if (position.ParentPosition == null)
                    {
                        position.ParentPosition = new ParentPosition() { Position = position };
                    }
                    position.ParentPosition.Squad = parentPosition.Squad;
                    position.ParentPosition.Phase = parentPosition.Squad!.Phase;
                    position.ParentPosition.Value = parentPosition.Value;

                    var poule = mapPoules[parentPosition.Squad!.Tournify];
                    string pos = parentPosition.Value == 1 ? "1er" : $"{parentPosition.Value}ème";
                    if (poule.bracket != null)
                    {
                        pos = parentPosition.Value == 1 ? "Gagnant" : "Perdant";
                    }

                    position.Name = tourney.HasTournifySynchroName || string.IsNullOrEmpty(position.Name) ? $"{pos} {parentPosition.Squad.Name}" : position.Name;
                    position.Short = tourney.HasTournifySynchroName || string.IsNullOrEmpty(position.Short) ? $"{parentPosition.Value}" : position.Short;
                }

            });

            query = doc.Collection("days");
            querySnapshot = await query.GetSnapshotAsync();
            var mapDays = querySnapshot.ToDictionary(p => p.Id, p => p.ConvertTo<DayTournify>());


            query = doc.Collection("matches");
            querySnapshot = await query.GetSnapshotAsync();
            var mapMatches = querySnapshot.ToDictionary(p => p.Id, p => p.ConvertTo<MatchTournify>());
            mapMatches.Keys.ToList().ForEach(id =>
            {
                var matchTournify = mapMatches[id];
                if (matchTournify.st == null)
                {
                    return;
                }
                var poule = mapPoules[matchTournify.poule!];
                var squad = poule.Squad!;
                var positionA = squad.Positions.Single(p => p.Value == (matchTournify.team1 + 1));
                var positionB = squad.Positions.Single(p => p.Value == (matchTournify.team2 + 1));
                var match = squad.Matches.SingleOrDefault(m => m.Tournify == id);
                if (match == null)
                {
                    match = new Models.Match() { PositionA = positionA, PositionB = positionB };
                    squad.Matches.Add(match);
                }
                match.Tournify = id;
                match.Shot = !string.IsNullOrEmpty(matchTournify.bracket);

                var day = matchTournify.day;
                var date = tourney.StartTime;
                if (day != null && day != "0")
                {
                    date = DateTimeOffset.FromUnixTimeSeconds(mapDays[day].date).ToLocalTime().DateTime;
                }
                var times = matchTournify.st!.Split(":");
                TimeSpan ts = new TimeSpan(int.Parse(times[0]), int.Parse(times[1]), 0);
                date = date.Date + ts;
                match.Time = date;
                if (matchTournify.score1.HasValue && matchTournify.score2.HasValue)
                {
                    match.ScoreA = matchTournify.score1.Value;
                    match.ScoreB = matchTournify.score2.Value;
                    match.Done = true;
                }
                else
                {
                    match.ScoreA = 0;
                    match.ScoreB = 0;
                    match.Done = false;
                }
                var field = tourneyTournify.fields[matchTournify.field];
                if (field != null)
                {
                    match.Location = field.name;
                }

                var div = division.fases.Single(f => f.Phase == squad.Phase);
                if (match.Time < div.MinTime)
                {
                    div.MinTime = match.Time;
                }
                if (match.Time > div.MaxTime)
                {
                    div.MaxTime = match.Time;
                }
            });

            tourneyTournify.breaks.Values.ToList().ForEach(b =>
            {
                var day = b.day;
                var date = tourney.StartTime;
                if (day != null && day != "0")
                {
                    date = DateTimeOffset.FromUnixTimeSeconds(mapDays[day].date).ToLocalTime().DateTime;
                }
                if (b.st == null)
                {
                    return;
                }
                var times = b.st!.Split(":");
                TimeSpan ts = new TimeSpan(int.Parse(times[0]), int.Parse(times[1]), 0);
                date = date.Date + ts;

                var d = division.fases.FirstOrDefault(f => f.MinTime <= date && f.MaxTime >= date);
                if (d == null)
                {
                    d = division.fases.LastOrDefault(f => f.MinTime <= date);
                }
                if (d == null)
                {
                    d = division.fases.FirstOrDefault(f => f.MaxTime >= date);
                }
                if (d != null)
                {
                    var evt = d.Phase.Events.SingleOrDefault(e => e.Tournify == b.id);
                    if (evt == null)
                    {
                        evt = new Event() { Name = b.name, EventType = EventType.Info };
                        d.Phase.Events.Add(evt);
                    }
                    string name = b.name;
                    var field = tourneyTournify.fields[b.field];
                    if (field != null)
                    {
                        name = $"{name} {field.name}";
                    }

                    evt.Name = true || tourney.HasTournifySynchroName ? name : evt.Name;
                    evt.Tournify = b.id;
                    evt.Time = date;
                }

            });

            context.SaveChanges();
            _memoryCache.Remove(tourney.Uid);

            return tourney;
        }

    }
}
