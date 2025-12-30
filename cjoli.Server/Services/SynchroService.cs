using AutoMapper;
using cjoli.Server.Models;
using cjoli.Server.Models.Tournify;
using Google.Cloud.Firestore;
using Google.Cloud.Firestore.V1;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;

namespace cjoli.Server.Services
{
    public class SynchroService
    {

        private SettingService _settingService;
        private readonly IMemoryCache _memoryCache;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly ILogger<SynchroService> _logger;
        private readonly ServerService _serverService;
        private readonly CJoliService _cjoliService;

        public SynchroService(
            SettingService settingService,
            IMemoryCache memoryCache,
            IConfiguration configuration,
            IMapper mapper,
            ILogger<SynchroService> logger,
            ServerService serverService,
            CJoliService cJoliService
            )
        {
            _settingService = settingService;
            _memoryCache = memoryCache;
            _configuration = configuration;
            _mapper = mapper;
            _logger = logger;
            _serverService = serverService;
            _cjoliService = cJoliService;
        }

        private FirestoreDb CreateDb()
        {
            var builder = new FirestoreClientBuilder();
            builder.ApiKey = _configuration["FirebaseApiKey"];
            FirestoreClient client = builder.Build();

            FirestoreDb db = FirestoreDb.Create(_configuration["FirebaseProject"], client);
            return db;
        }

        public class ActionItem
        {
            public required Query Query;
            public required Func<QuerySnapshot, Task> Action;
        }

        public async Task<Tourney?> Synchro(string uid, CJoliContext context, CancellationToken? stoppingToken)
        {
            try
            {
                return await ExecuteSynchro(uid, context, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Unable to execute synchro, {ex}");
                throw;
            }
        }

        public async Task<Tourney?> ExecuteSynchro(string uid, CJoliContext context, CancellationToken? stoppingToken)
        {
            var session = new SessionTournify();

            var tourney = context.Tourneys
            .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Positions).ThenInclude(p => p.ParentPosition)
            .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Matches)
            .Include(t => t.Phases).ThenInclude(p => p.Events).ThenInclude(e => e.Positions)
            .Include(t => t.Teams).ThenInclude(t => t.TeamDatas.Where(t => t.Tourney.Uid == uid))
            .Include(t => t.Teams).ThenInclude(t => t.MatchResults)
            .Include(t => t.Ranks)
            .Single(t => t.Uid == uid);

            if (string.IsNullOrEmpty(tourney.Tournify))
            {
                return tourney;
            }

            FirestoreDb db = CreateDb();

            //Tourney
            var queryTourney = db.Collection("tournaments").WhereEqualTo("liveLink", tourney.Tournify);

            var snapshot = await queryTourney.GetSnapshotAsync();
            if (snapshot.Documents.Count == 0)
            {
                _logger.LogWarning($"no tournify found for uid:{uid} and tournify:${tourney.Tournify}");
                return null;
            }
            session.Id = snapshot.Documents.First().Id;

            var doc = db.Collection("tournaments").Document(session.Id);

            var queryTeam = doc.Collection("teams");
            var queryPhase = doc.Collection("divisions");
            var queryBracket = doc.Collection("brackets");
            var querySquad = doc.Collection("poules");
            var queryPosition = doc.Collection("resultSpots");
            var queryMatch = doc.Collection("matches");

            var list = new[]
            {
                new ActionItem(){Query = queryTourney, Action=async snapshot => await UpdateTourney(snapshot, session, tourney, context)},
                new ActionItem(){Query = queryTeam, Action=async snapshot => await UpdateTeam(snapshot, session, doc, tourney, context)},
                new ActionItem(){Query = queryPhase, Action=async snapshot => await UpdatePhase(snapshot, session, doc, tourney, context)},
                new ActionItem(){Query = queryBracket, Action=async snapshot => await UpdateBracket(snapshot, session, doc, tourney, context)},
                new ActionItem(){Query = querySquad, Action=async snapshot => await UpdateSquad(snapshot, session, doc, tourney, context)},
                new ActionItem(){Query = queryPosition, Action=async snapshot => await UpdatePosition(snapshot, session, doc, tourney, context)},
                new ActionItem(){Query = queryMatch, Action=async snapshot => await UpdateMatch(snapshot, session, doc, tourney, context)},
            };

            if (stoppingToken != null)
            {
                list.ToList().ForEach(action =>
                {
                    var listener = action.Query.Listen(async snapshot =>
                    {
                        await Update(async () => await action.Action(snapshot), session, tourney, context);
                    });
                    session.Listeners.Add(listener);
                });

                while (!stoppingToken.Value.IsCancellationRequested)
                {
                    await Task.Delay(1000, stoppingToken.Value);
                }
                session.Listeners.ForEach(async listener => await listener.StopAsync());

            }
            else
            {
                foreach (var action in list)
                {
                    var snap = await action.Query.GetSnapshotAsync();
                    await action.Action(snap);
                }
                context.SaveChanges();
                _memoryCache.Remove(tourney.Uid);

            }

            return tourney;
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
                _logger.LogError(e, $"Unable to update tourney:{tourney.Uid}");
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
            //endTime = endTime.AddDays(360);//TO remove

            tourney.EndTime = endTime;

            UpdateEvent(tourneyTournify, tourney, mapDays);
        }

        private void UpdateEvent(TourneyTournify tourneyTournify, Tourney tourney, Dictionary<string, DayTournify> mapDays)
        {
            foreach (var breakTournify in tourneyTournify.breaks!.Values.ToList())
            {
                try
                {
                    var day = breakTournify.day;
                    var date = tourney.StartTime;
                    if (day != null && day != "0")
                    {
                        date = DateTimeOffset.FromUnixTimeSeconds(mapDays[day].date).ToLocalTime().DateTime;
                    }
                    if (breakTournify == null || breakTournify.st == null)
                    {
                        continue;
                    }
                    var times = breakTournify.st!.Split(":");
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
                        var evt = tourney.Phases.SelectMany(p => p.Events).SingleOrDefault(e => e.Tournify == breakTournify.id);
                        string name = breakTournify.name!;
                        if (evt == null)
                        {
                            evt = new Event() { Name = name, EventType = EventType.Info };
                            phase.Events.Add(evt);
                        }
                        if (breakTournify.field != null)
                        {
                            var field = tourneyTournify.fields![breakTournify.field!];
                            if (field != null)
                            {
                                name = $"{name} {field.name}";
                            }
                        }

                        evt.Name = tourney.HasTournifySynchroName ? name : evt.Name;
                        evt.Tournify = breakTournify.id;
                        evt.Time = date;

                    }
                }
                catch (Exception e)
                {
                    _logger.LogError(e, $"Invalid event, ignore it, event:{JsonSerializer.Serialize(breakTournify)}");
                }

            }

        }

        private async Task<KeyValuePair<string, DivisionTournify>> GetDivision(DocumentReference doc, Tourney tourney)
        {
            var divisions = await GetMap<DivisionTournify>("divisions", doc);
            var division = divisions.SingleOrDefault(d => d.Value.name == tourney.Category);
            if (division.Key == null && divisions != null)
            {
                division = divisions.FirstOrDefault();
            }
            if (division.Key == null)
            {
                throw new Exception("Unable to find division");
            }
            return division;
        }


        private async Task UpdateTeam(QuerySnapshot snapshot, SessionTournify session, DocumentReference doc, Tourney tourney, CJoliContext context)
        {
            var mapTeams = snapshot.ToDictionary(t => t.Id, t => t.ConvertTo<TeamTournify>());
            session.Teams = new Dictionary<string, Team>();

            var division = await GetDivision(doc, tourney);

            foreach (var id in mapTeams.Where(t => t.Value.division == division.Key).Select(k => k.Key))
            {
                var teamTournify = mapTeams[id]!;
                var team = context.Team.Include(t => t.TeamDatas.Where(t => t.Tourney.Uid == tourney.Uid))
                    .FirstOrDefault(t => t.Name.ToLower() == teamTournify.name!.ToLower() || t.TeamDatas.SingleOrDefault(d => d.Tournify == id) != null);
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
                if (tourney.Teams.SingleOrDefault(t => t.Id == team.Id) == null)
                {
                    tourney.Teams.Add(team);
                }
                session.Teams.Add(id, team);
            }
        }

        private async Task UpdatePhase(QuerySnapshot snapshot, SessionTournify session, DocumentReference doc, Tourney tourney, CJoliContext context)
        {
            TourneyTournify tourneyTournify = (await doc.GetSnapshotAsync()).ConvertTo<TourneyTournify>();
            var mapDays = await GetMap<DayTournify>("days", doc);

            var division = await GetDivision(doc, tourney);//snapshot.First().ConvertTo<DivisionTournify>();

            int i = 0;
            var phases = tourney.Phases;
            foreach (var f in division.Value.fases)
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

            UpdateEvent(tourneyTournify, tourney, mapDays);
        }
        private async Task UpdateBracket(QuerySnapshot snapshot, SessionTournify session, DocumentReference doc, Tourney tourney, CJoliContext context)
        {
            var mapBrackets = snapshot.ToDictionary(p => p.Id, p => p.ConvertTo<BracketTournify>());
            var division = await GetDivision(doc, tourney);

            foreach (var id in mapBrackets.Where(b => b.Value.division == division.Key).Select(b => b.Key))
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

        }

        private async Task UpdateSquad(QuerySnapshot snapshot, SessionTournify session, DocumentReference doc, Tourney tourney, CJoliContext context)
        {
            var dicoPoules = snapshot.ToDictionary(p => p.Id, p => p.ToDictionary());

            var mapPoules = snapshot.ToDictionary(p => p.Id, p => p.ConvertTo<PouleTournify>());
            var division = await GetDivision(doc, tourney);

            foreach (var id in mapPoules.Where(p => p.Value.division == division.Key).Select(d => d.Key))
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

                    foreach (var position in squad.Positions)
                    {
                        position.Penalty = GetBonus(poule, position.Value - 1);
                    }

                    //poule.Squad = squad;
                }
            }
        }

        private int GetBonus(PouleTournify poule, int rank)
        {
            int bonus = 0;
            string sRank = rank + "";
            if (poule.minusPoints.ContainsKey(sRank))
            {
                bonus += poule.minusPoints[sRank];
            }
            if (poule.plusPoints.ContainsKey(sRank))
            {
                bonus += poule.plusPoints[sRank];
            }
            return -bonus;
        }

        private async Task UpdatePosition(QuerySnapshot snapshot, SessionTournify session, DocumentReference doc, Tourney tourney, CJoliContext context)
        {
            var mapTeams = await GetMap<TeamTournify>("teams", doc);
            var mapPoules = await GetMap<PouleTournify>("poules", doc);
            var mapBrackets = await GetMap<BracketTournify>("brackets", doc);

            var mapSpot = snapshot.ToDictionary(p => p.Id, p => p.ConvertTo<SpotTournify>());
            var dicoSpots = snapshot.ToDictionary(p => p.Id, p => p.ToDictionary());

            var squads = tourney.Phases.SelectMany(p => p.Squads);
            var mapListSpotByPoule = new Dictionary<string, List<(long, SpotTournify)>>();
            var division = await GetDivision(doc, tourney);

            foreach (var id in mapSpot.Where(s => s.Value.division == division.Key).Select(d => d.Key))
            {
                var spot = mapSpot[id]!;
                var poule = mapPoules[spot.fromPoule!];


                var dico = dicoSpots[id]!;
                for (int i = 1; i < 10; i++)
                {
                    if (dico.ContainsKey($"poule{i}") && dico[$"poule{i}"] != null)
                    {
                        string pouleId = (string)dico[$"poule{i}"];
                        long num = (long)dico[$"numInPoule{i}"];
                        List<(long, SpotTournify)>? list;
                        mapListSpotByPoule.TryGetValue(pouleId, out list);
                        if (list == null)
                        {
                            list = new List<(long, SpotTournify)>();
                            mapListSpotByPoule[pouleId] = list;
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
                else
                {
                    position.Team = null;
                }
                position.Tournify = id;

                position.Penalty = GetBonus(poule, spot.rank);

                if (bracketId != null)
                {
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
                    }
                    position.Value += delta;
                    position.TournifyPoule = $"{spot.fromPoule}-{spot.rank}";
                }
                spot.Position = position;

            }

            context.SaveChanges();
            foreach (var id in mapSpot.Keys.ToList())
            {
                var spot = mapSpot[id]!;
                if (mapListSpotByPoule.ContainsKey(spot.fromPoule!))
                {

                    var position = spot.Position!;
                    var poule = mapPoules[spot.fromPoule!];

                    List<(long, SpotTournify)> listSpot = mapListSpotByPoule[spot.fromPoule!];
                    var parentSpot = listSpot.Single(p => p.Item1 == spot.rank).Item2;
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
                        var pos = parentSpot.rank == 0 ? "Gagnant" : "Perdant";
                        position.MatchOrder = parentPoule.bracketRound + parentPoule.num;
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

                        string pos = parentPosition.Value == 1 ? "1er" : $"{parentPosition.Value}ème";

                        position.Name = tourney.HasTournifySynchroName || string.IsNullOrEmpty(position.Name) ? $"{pos} {parentPosition.Squad.Name}" : position.Name;
                        position.Short = tourney.HasTournifySynchroName || string.IsNullOrEmpty(position.Short) ? $"{parentPosition.Value}" : position.Short;
                    }

                }

            }

            context.SaveChanges();

        }

        private async Task UpdateMatch(QuerySnapshot snapshot, SessionTournify session, DocumentReference doc, Tourney tourney, CJoliContext context)
        {
            var mapDays = await GetMap<DayTournify>("days", doc);
            var mapBrackets = await GetMap<BracketTournify>("brackets", doc);
            var mapPoules = await GetMap<PouleTournify>("poules", doc);
            TourneyTournify tourneyTournify = (await doc.GetSnapshotAsync()).ConvertTo<TourneyTournify>();

            var division = await GetDivision(doc, tourney);

            var squads = tourney.Phases.SelectMany(p => p.Squads);

            var mapMatches = snapshot.ToDictionary(p => p.Id, p => p.ConvertTo<MatchTournify>());
            foreach (string id in mapMatches.Keys)
            {
                var matchTournify = mapMatches[id];
                if (matchTournify.st == null)
                {
                    continue;
                }
                var poule = mapPoules[matchTournify.poule!];
                if (poule.division != division.Key)
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
                    //_cjoliService.SaveMatchResult(match.PositionA, match.PositionB, match, match.ScoreA, match.ScoreB);
                    //_cjoliService.SaveMatchResult(match.PositionB, match.PositionA, match, match.ScoreB, match.ScoreA);
                }
                else
                {
                    match.ScoreA = 0;
                    match.ScoreB = 0;
                    match.Done = false;

                    foreach (var matchResult in match.MatchResults)
                    {
                        context.Remove(matchResult);
                    }


                }
                var field = tourneyTournify.fields[matchTournify.field];
                if (field != null)
                {
                    match.Location = field.name;
                }
            }
            context.SaveChanges();
        }


    }
}
