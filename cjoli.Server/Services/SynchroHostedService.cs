
using cjoli.Server.Models;
using cjoli.Server.Models.Tournify;
using Google.Cloud.Firestore;
using Google.Cloud.Firestore.V1;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;

namespace cjoli.Server.Services
{
    public class SynchroHostedService : BackgroundService
    {
        private readonly IServiceProvider _service;
        private readonly ILogger<SynchroHostedService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _memoryCache;
        private readonly ServerService _serverService;
        private readonly SynchroService _synchroService;

        private Dictionary<string, CancellationTokenSource> _threads = new Dictionary<string, CancellationTokenSource>();

        public SynchroHostedService(IServiceProvider service, ILogger<SynchroHostedService> logger, IConfiguration configuration, IMemoryCache memoryCache, ServerService serverService, SynchroService synchroService)
        {
            _service = service;
            _logger = logger;
            _configuration = configuration;
            _memoryCache = memoryCache;
            _serverService = serverService;
            _synchroService = synchroService;
        }


        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using var scope = _service.CreateScope();


            var context = scope.ServiceProvider.GetService<CJoliContext>()!;

            _threads = context.Tourneys.Where(t => t.Tournify != null && t.EndTime >= DateTime.Now).ToDictionary(t => t.Uid, t =>
            {
                CancellationTokenSource source = new CancellationTokenSource();
                var thread = CreateThread(t.Uid, source.Token);
                thread.Start();
                return source;
            });

            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(60 * 60 * 1000, stoppingToken);
            }

            return;

        }

        private Thread CreateThread(string uid, CancellationToken stoppingToken)
        {
            var thread = new Thread(new ThreadStart(async () =>
            {
                using var scope = _service.CreateScope();
                var session = new SessionTournify();

                var context = scope.ServiceProvider.GetService<CJoliContext>()!;

                //await _synchroService.Synchro(uid, context);

                var tourney = context.Tourneys
                        .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Positions).ThenInclude(p => p.ParentPosition)
                        .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Matches)
                        .Include(t => t.Phases).ThenInclude(p => p.Events).ThenInclude(e => e.Positions)
                        .Include(t => t.Teams).ThenInclude(t => t.TeamDatas.Where(t => t.Tourney.Uid == uid))
                        .Include(t => t.Ranks)
                        .Single(t => t.Uid == uid);

                if (string.IsNullOrEmpty(tourney.Tournify))
                {
                    return;
                }

                FirestoreDb db = CreateDb();

                //Tourney
                var queryTourney = db.Collection("tournaments").WhereEqualTo("liveLink", tourney.Tournify);

                var snapshot = await queryTourney.GetSnapshotAsync();
                session.Id = snapshot.Documents.First().Id;

                session.Listeners.Add(queryTourney.Listen(async snapshot =>
                {
                    await UpdateTourney(snapshot, session, tourney, context);
                }));

                var doc = db.Collection("tournaments").Document(session.Id);

                //Team
                var queryTeam = doc.Collection("teams");
                session.Listeners.Add(queryTeam.Listen(async snapshot =>
                {
                    await UpdateTeam(snapshot, session, tourney, context);
                }));


                //Phase
                var queryPhase = doc.Collection("divisions");
                session.Listeners.Add(queryPhase.Listen(async snapshot =>
                {
                    await UpdatePhase(snapshot, session, doc, tourney, context);
                }));

                var queryBracket = doc.Collection("brackets");
                session.Listeners.Add(queryBracket.Listen(async snapshot =>
                {
                    await UpdateBracket(snapshot, session, tourney, context);
                }));

                //Squad
                var querySquad = doc.Collection("poules");
                session.Listeners.Add(querySquad.Listen(async snapshot =>
                {
                    await UpdateSquad(snapshot, session, tourney, context);
                }));

                //Position
                var queryPosition = doc.Collection("resultSpots");
                session.Listeners.Add(queryPosition.Listen(async snapshot =>
                {
                    await UpdatePosition(snapshot, session, doc, tourney, context);
                }));

                //Match
                var queryMatch = doc.Collection("matches");
                session.Listeners.Add(queryMatch.Listen(async snapshot =>
                {
                    await UpdateMatch(snapshot, session, doc, tourney, context);
                }));

                while (!stoppingToken.IsCancellationRequested)
                {
                    await Task.Delay(1000, stoppingToken);
                }
                session.Listeners.ForEach(async listener => await listener.StopAsync());

            }));
            return thread;
        }

        private async Task Update(Func<Task> callback, SessionTournify session, Tourney tourney, CJoliContext context)
        {
            await session.Lock.WaitAsync();
            try
            {
                await context.Entry(tourney).ReloadAsync();
                await callback();
                context.SaveChanges();
                _memoryCache.Remove(tourney.Uid);
                _serverService.UpdateRanking(tourney.Uid);
            }
            catch (Exception e)
            {
                _logger.LogError("Unable to update", e);
            }
            finally
            {
                session.Lock.Release();
            }
        }

        private async Task<Dictionary<string, T>> GetMap<T>(string name, DocumentReference doc)
        {
            var snapshot = await doc.Collection(name).GetSnapshotAsync();
            return snapshot.ToDictionary(o => o.Id, o => o.ConvertTo<T>());
        }



        private async Task UpdateTourney(QuerySnapshot snapshot, SessionTournify session, Tourney tourney, CJoliContext context)
        {
            await Update(async () =>
            {

                var docTourney = snapshot.Documents.First();

                var mapDays = await GetMap<DayTournify>("days", docTourney.Reference);

                TourneyTournify tourneyTournify = docTourney.ConvertTo<TourneyTournify>();
                tourney.Name = tourney.HasTournifySynchroName ? tourneyTournify.name ?? tourney.Name : tourney.Name;
                tourney.StartTime = DateTimeOffset.FromUnixTimeSeconds(tourneyTournify.date).ToLocalTime().DateTime;

                tourney.RuleConfig = JsonSerializer.Serialize(tourneyTournify);

                var lastMatch = tourney.Phases.SelectMany(p => p.Squads.SelectMany(s => s.Matches)).OrderByDescending(m => m.Time).FirstOrDefault();
                var lastEvent = tourney.Phases.SelectMany(p => p.Events).OrderByDescending(e => e.Time).FirstOrDefault();
                var endTime = tourney.StartTime.AddDays(1);
                if (lastMatch != null && lastMatch.Time > endTime)
                {
                    endTime = lastMatch.Time;
                }
                if (lastEvent != null && lastEvent.Time > endTime)
                {
                    endTime = lastEvent.Time;
                }
                endTime = endTime.AddDays(360);//TO remove

                tourney.EndTime = endTime;

                UpdateEvent(tourneyTournify, tourney, mapDays);

            }, session, tourney, context);
        }

        private void UpdateEvent(TourneyTournify tourneyTournify, Tourney tourney, Dictionary<string, DayTournify> mapDays)
        {
            foreach (var b in tourneyTournify.breaks!.Values.ToList())
            {
                var day = b.day;
                var date = tourney.StartTime;
                if (day != null && day != "0")
                {
                    date = DateTimeOffset.FromUnixTimeSeconds(mapDays[day].date).ToLocalTime().DateTime;
                }
                if (b == null || b.st == null)
                {
                    continue;
                }
                var times = b.st!.Split(":");
                TimeSpan ts = new TimeSpan(int.Parse(times[0]), int.Parse(times[1]), 0);
                date = date.Date + ts;

                var mapTimes = tourney.Phases.Select(p =>
                {
                    var matches = p.Squads.SelectMany(s => s.Matches).OrderBy(m => m.Time);
                    if (matches.Count() == 0)
                    {
                        return (Phase: p, MinTime: DateTime.MaxValue, MaxTime: DateTime.MinValue);
                    }
                    return (Phase: p, MinTime: matches.First().Time, MaxTime: matches.Last().Time);
                }).ToList();

                var phase = mapTimes.FirstOrDefault(p => p.MinTime <= date && p.MaxTime >= date).Phase;
                if (phase == null)
                {
                    phase = mapTimes.LastOrDefault(p => p.MinTime <= date).Phase;
                }
                if (phase == null)
                {
                    phase = mapTimes.FirstOrDefault(p => p.MaxTime >= date).Phase;
                }
                if (phase != null)
                {
                    var evt = tourney.Phases.SelectMany(p => p.Events).SingleOrDefault(e => e.Tournify == b.id);
                    string name = b.name!;
                    if (evt == null)
                    {
                        evt = new Event() { Name = name, EventType = EventType.Info };
                        phase.Events.Add(evt);
                    }
                    if (b.field != null)
                    {
                        var field = tourneyTournify.fields![b.field!];
                        if (field != null)
                        {
                            name = $"{name} {field.name}";
                        }
                    }

                    evt.Name = true || tourney.HasTournifySynchroName ? name : evt.Name;
                    evt.Tournify = b.id;
                    evt.Time = date;

                }

            }

        }


        private async Task UpdateTeam(QuerySnapshot snapshot, SessionTournify session, Tourney tourney, CJoliContext context)
        {
            await Update(async () =>
            {
                var mapTeams = snapshot.ToDictionary(t => t.Id, t => t.ConvertTo<TeamTournify>());
                session.Teams = new Dictionary<string, Team>();
                foreach (var id in mapTeams.Keys.ToList())
                {
                    var teamTournify = mapTeams[id]!;
                    var team = context.Team.Include(t => t.TeamDatas.Where(t => t.Tourney.Uid == tourney.Uid))
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
                    session.Teams.Add(id, team);
                }
                ;

            }, session, tourney, context);
        }

        private async Task UpdatePhase(QuerySnapshot snapshot, SessionTournify session, DocumentReference doc, Tourney tourney, CJoliContext context)
        {
            await Update(async () =>
            {
                TourneyTournify tourneyTournify = (await doc.GetSnapshotAsync()).ConvertTo<TourneyTournify>();
                var mapDays = await GetMap<DayTournify>("days", doc);

                var division = snapshot.First().ConvertTo<DivisionTournify>();

                int i = 0;
                var phases = tourney.Phases;
                foreach (var f in division.fases)
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

                    i++;
                }
                ;

                UpdateEvent(tourneyTournify, tourney, mapDays);
            }, session, tourney, context);
        }
        private async Task UpdateBracket(QuerySnapshot snapshot, SessionTournify session, Tourney tourney, CJoliContext context)
        {
            await Update(async () =>
            {
                var mapBrackets = snapshot.ToDictionary(p => p.Id, p => p.ConvertTo<BracketTournify>());

                foreach (var id in mapBrackets.Keys.ToList())
                {
                    var bracket = mapBrackets[id];
                    session.Brackets[id] = bracket;
                    if (bracket.subBracketTo != null)
                    {
                        continue;
                    }
                    var phase = tourney.Phases[bracket.fase];
                    var squad = phase.Squads.SingleOrDefault(s => s.Name.ToLower() == bracket.name!.ToLower() || s.Tournify == id);
                    if (squad == null)
                    {
                        squad = new Squad() { Name = bracket.name!, Phase = phase };
                        phase.Squads.Add(squad);
                    }
                    squad.Name = tourney.HasTournifySynchroName ? bracket.name! : squad.Name;
                    squad.Tournify = id;
                    squad.Order = bracket.num;
                    squad.Type = SquadType.Bracket;
                    squad.BracketSize = bracket.size;
                }
            }, session, tourney, context
            );

        }

        private async Task UpdateSquad(QuerySnapshot snapshot, SessionTournify session, Tourney tourney, CJoliContext context)
        {
            await Update(async () =>
            {
                var mapPoules = snapshot.ToDictionary(p => p.Id, p => p.ConvertTo<PouleTournify>());

                foreach (var id in mapPoules.Keys.ToList())
                {
                    var poule = mapPoules[id]!;
                    if (poule.bracket == null) //create a squad only for poule with bracket
                    {
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
                        //poule.Squad = squad;
                    }
                }
                ;

            }, session, tourney, context);
        }

        private async Task UpdatePosition(QuerySnapshot snapshot, SessionTournify session, DocumentReference doc, Tourney tourney, CJoliContext context)
        {
            await Update(async () =>
            {
                var mapTeams = await GetMap<TeamTournify>("teams", doc);
                var mapPoules = await GetMap<PouleTournify>("poules", doc);
                var mapBrackets = await GetMap<BracketTournify>("brackets", doc);

                var mapSpot = snapshot.ToDictionary(p => p.Id, p => p.ConvertTo<SpotTournify>());
                var dicoSpots = snapshot.ToDictionary(p => p.Id, p => p.ToDictionary());

                var squads = tourney.Phases.SelectMany(p => p.Squads);
                var map = new Dictionary<string, List<(long, SpotTournify)>>();
                foreach (var id in mapSpot.Keys.ToList())
                {
                    var spot = mapSpot[id]!;

                    var dico = dicoSpots[id]!;
                    for (int i = 1; i < 10; i++)
                    {
                        if (dico.ContainsKey($"poule{i}") && dico[$"poule{i}"] != null)
                        {
                            string poule = (string)dico[$"poule{i}"];
                            long num = (long)dico[$"numInPoule{i}"];
                            List<(long, SpotTournify)>? list;
                            map.TryGetValue(poule, out list);
                            if (list == null)
                            {
                                list = new List<(long, SpotTournify)>();
                                map[poule] = list;
                            }
                            list.Add((num, spot));
                        }
                    }
                    string? bracketId = null;
                    if (spot.belongsToBracket != null)
                    {
                        bracketId = session.GetRootBracket(spot.belongsToBracket);
                    }
                    var squad = squads.Single(s => bracketId != null ? s.Tournify == bracketId : s.Tournify == spot.fromPoule);
                    var position = squad.Positions.SingleOrDefault(p => p.Tournify == id);
                    if (position == null)
                    {
                        position = new Position() { Value = spot.rank + 1 };
                        squad.Positions.Add(position);
                    }
                    var kvTeam = mapTeams.Where(kv => kv.Value.poule0 == spot.fromPoule && kv.Value.numInPoule0 == spot.rank).SingleOrDefault();
                    if (kvTeam.Key != null) // affect default team to position
                    {
                        var team = session.Teams[kvTeam.Key];
                        position.Team = team;
                    }
                    position.Tournify = id;
                    if (bracketId != null)
                    {
                        var poule = mapPoules[spot.fromPoule!];
                        var bracket = mapBrackets[poule.bracket!];
                        var max = (int)Math.Log2(bracket.size);
                        var num = poule.GetTypeMatchNum();
                        int delta = 0;
                        for (int i = max; i > num; i--)
                        {
                            delta += (int)Math.Pow(2, i);
                        }

                        position.MatchType = Match.GetMatchTypeFromNum(num + 1);
                        position.MatchOrder = poule.bracketRound + poule.num;

                        position.Value = 2 * (poule.bracketRound + poule.num) - 1 + spot.rank;
                        if (bracket.subBracketTo != null)
                        {
                            bracket = mapBrackets[bracket.subBracketTo];
                            position.Value += bracket.size;
                            //position.MatchOrder -= bracket.size;
                        }
                        position.Value += delta;
                        position.TournifyPoule = $"{spot.fromPoule}-{spot.rank}";
                    }
                    spot.Position = position;

                }
                ;

                context.SaveChanges();
                foreach (var id in mapSpot.Keys.ToList())
                {
                    var spot = mapSpot[id]!;
                    if (map.ContainsKey(spot.fromPoule!))
                    {

                        var position = spot.Position!;
                        var poule = mapPoules[spot.fromPoule!];

                        List<(long, SpotTournify)> list = map[spot.fromPoule!];
                        var parentSpot = list.Single(p => p.Item1 == spot.rank).Item2;
                        var parentPosition = parentSpot.Position!;
                        var parentPoule = mapPoules[parentSpot.fromPoule!];


                        string? bracketId = null;
                        int level = 0;
                        if (spot.belongsToBracket != null)
                        {
                            bracketId = session.GetRootBracket(spot.belongsToBracket);
                            var bracket = mapBrackets[bracketId!];
                            level = bracket.GetOrder(poule);
                        }
                        if (bracketId != null && level > 0)
                        {
                            var round = parentPoule.bracketRound;
                            /*var num = (parentPoule.bracketRound + parentPoule.num) % parentPoule.bracketRound;
                            if (bracketId != parentSpot.belongsToBracket)
                            {
                                num += 2;
                            }*/

                            var pos = parentSpot.rank == 0 ? "Gagnant" : "Perdant";
                            position.MatchOrder = parentPosition.MatchOrder;
                            position.Name = $"{pos} {parentPoule.name}";

                            position.Winner = parentSpot.rank == 0;
                            position.ParentPosition = null;
                        }
                        else
                        {
                            position.MatchType = null;
                            position.Winner = false;

                            if (position.ParentPosition == null)
                            {
                                position.ParentPosition = new ParentPosition() { Position = position };
                            }
                            position.ParentPosition.Squad = parentPosition.Squad;
                            position.ParentPosition.Phase = parentPosition.Squad!.Phase;
                            position.ParentPosition.Value = parentPosition.Value;

                            //var poule = mapPoules[parentPosition.Squad!.Tournify];
                            string pos = parentPosition.Value == 1 ? "1er" : $"{parentPosition.Value}ème";
                            /*if (parentPoule.bracket != null)
                            {
                                pos = spot.rank == 0 ? "Gagnant" : "Perdant";
                            }*/

                            position.Name = tourney.HasTournifySynchroName || string.IsNullOrEmpty(position.Name) ? $"{pos} {parentPosition.Squad.Name}" : position.Name;
                            position.Name += " " + position.MatchOrder;
                            position.Short = tourney.HasTournifySynchroName || string.IsNullOrEmpty(position.Short) ? $"{parentPosition.Value}" : position.Short;
                        }

                    }

                }
                ;

            }, session, tourney, context);
        }

        private async Task UpdateMatch(QuerySnapshot snapshot, SessionTournify session, DocumentReference doc, Tourney tourney, CJoliContext context)
        {
            await Update(async () =>
            {
                var mapDays = await GetMap<DayTournify>("days", doc);
                var mapBrackets = await GetMap<BracketTournify>("brackets", doc);
                var mapPoules = await GetMap<PouleTournify>("poules", doc);
                TourneyTournify tourneyTournify = (await doc.GetSnapshotAsync()).ConvertTo<TourneyTournify>();
                var division = (await doc.Collection("divisions").GetSnapshotAsync()).First().ConvertTo<DivisionTournify>();

                var squads = tourney.Phases.SelectMany(p => p.Squads);

                var mapMatches = snapshot.ToDictionary(p => p.Id, p => p.ConvertTo<MatchTournify>());
                foreach (string id in mapMatches.Keys)
                {

                    var matchTournify = mapMatches[id];
                    if (matchTournify.st == null)
                    {
                        continue;
                    }

                    string? bracketId = null;
                    if (matchTournify.bracket != null)
                    {
                        bracketId = session.GetRootBracket(matchTournify.bracket);
                    }


                    var squad = squads.Single(s => bracketId != null ? s.Tournify == bracketId : s.Tournify == matchTournify.poule!);
                    var positionA = squad.Positions.Single(p => matchTournify.bracket != null ? p.TournifyPoule == $"{matchTournify.poule}-{matchTournify.team1}" : p.Value == (matchTournify.team1 + 1));
                    var positionB = squad.Positions.Single(p => matchTournify.bracket != null ? p.TournifyPoule == $"{matchTournify.poule}-{matchTournify.team2}" : p.Value == (matchTournify.team2 + 1));
                    var match = squad.Matches.SingleOrDefault(m => m.Tournify == id);
                    if (match == null)
                    {
                        match = new Match() { PositionA = positionA, PositionB = positionB };
                        squad.Matches.Add(match);
                    }
                    if (matchTournify.bracket != null)
                    {
                        var poule = mapPoules[matchTournify.poule!];
                        match.MatchType = Match.GetMatchTypeFromNum(poule.GetTypeMatchNum());
                        match.MatchOrder = poule.bracketRound + poule.num;
                        match.Name = $"{poule.name}";
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
                        if (matchTournify.winner.HasValue)
                        {
                            match.Winner = squad.Positions.Single(p => p.Value == (matchTournify.winner.Value + 1));
                        }
                        else
                        {
                            match.Winner = null;
                        }
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

                    //var div = division.fases.Single(f => f.Phase == squad.Phase);
                    /*if (match.Time < div.MinTime)
                    {
                        div.MinTime = match.Time;
                    }
                    if (match.Time > div.MaxTime)
                    {
                        div.MaxTime = match.Time;
                    }*/
                }

            }, session, tourney, context);
        }

        private FirestoreDb CreateDb()
        {
            var builder = new FirestoreClientBuilder();
            builder.ApiKey = _configuration["FirebaseApiKey"];
            FirestoreClient client = builder.Build();

            FirestoreDb db = FirestoreDb.Create(_configuration["FirebaseProject"], client);
            return db;
        }


    }
}
