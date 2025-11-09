using AutoMapper;
using cjoli.Server.Dtos;
using cjoli.Server.Exceptions;
using cjoli.Server.Extensions;
using cjoli.Server.Models;
using cjoli.Server.Services.Rules;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Data;
using System.Diagnostics;

namespace cjoli.Server.Services
{

    public class CJoliService
    {
        private readonly EstimateService _estimateService;
        private readonly ServerService _serverService;
        private readonly UserService _userService;
        private readonly IMapper _mapper;
        private readonly IServiceProvider _service;
        private readonly ILogger<CJoliService> _logger;
        private readonly IMemoryCache _memoryCache;
        private readonly IConfiguration _configuration;
        private readonly Dictionary<string, ReaderWriterLockSlim> locks = new Dictionary<string, ReaderWriterLockSlim>();


        private readonly Dictionary<string, IRule> _rules = new Dictionary<string, IRule>();

        public CJoliService(
            EstimateService estimateService,
            ServerService serverService,
            UserService userService,
            IMapper mapper,
            IServiceProvider service,
            ILogger<CJoliService> logger,
            IMemoryCache memoryCache,
            IConfiguration configuration
         )
        {
            _estimateService = estimateService;
            _serverService = serverService;
            _userService = userService;
            _mapper = mapper;
            _service = service;
            _logger = logger;
            _memoryCache = memoryCache;
            _configuration = configuration;

            _rules.Add("simple", new SimpleRule(this));
            _rules.Add("simple210", new Simple210Rule(this));
            _rules.Add("simple310", new Simple310Rule(this));
            _rules.Add("simple320", new Simple320Rule(this));
            _rules.Add("simple321", new Simple321Rule(this));

            _rules.Add("simple310Goal", new Simple310GoalRule(this));
            _rules.Add("simple310Average", new Simple310AverageRule(this));


            _rules.Add("lyon", new LyonRule(this));
            _rules.Add("scooby", new ScoobyRule(this));
            _rules.Add("henderson", new HendersonRule(this));
            _rules.Add("hogly", new HoglyRule(this));
            _rules.Add("nordcup", new NordCupRule(this));
        }

        private IRule GetRule(Tourney tourney)
        {
            string ruleName = tourney.Rule ?? "simple";
            if (ruleName == "tournify")
            {
                return new TournifyRule(this, tourney);
            }
            return _rules.ContainsKey(ruleName) ? _rules[ruleName] : _rules["simple"];
        }

        public List<Tourney> ListTourneys(CJoliContext context)
        {
            return context.Tourneys.OrderByDescending(t => t.StartTime).ToList().Select(t =>
            {
                t.Config = GetRule(t);
                return t;
            }).ToList();
        }

        public List<Team> ListTeams(CJoliContext context)
        {
            return context.Team.OrderBy(t => t.Name).ToList();
        }

        private User GetUserWithConfigMatch(string login, string tourneyUid, CJoliContext context)
        {
            User? user = context.Users
                .Include(u => u.Configs.Where(c => c.Tourney.Uid == tourneyUid)).ThenInclude(c => c.Tourney)
                .Include(u => u.Configs.Where(c => c.Tourney.Uid == tourneyUid)).ThenInclude(c => c.FavoriteTeam)
                .Include(u => u.UserMatches).SingleOrDefault(u => u.Login == login);
            if (user == null)
            {
                throw new NotFoundException("User", login);
            }
            return user;
        }

        private User? GetUserWithConfig(string? login, string tourneyUid, CJoliContext context)
        {
            return context.Users
                .Include(u => u.Configs.Where(c => c.Tourney.Uid == tourneyUid)).ThenInclude(c => c.Tourney)
                .Include(u => u.Configs.Where(c => c.Tourney.Uid == tourneyUid)).ThenInclude(c => c.FavoriteTeam)
                .SingleOrDefault(u => u.Login == login);
        }

        private Tourney GetTourney(string tourneyUid, User? user, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys
                .Include(t => t.Phases).ThenInclude(p => p.Squads.OrderBy(s => s.Order)).ThenInclude(s => s.Positions.OrderBy(p => p.Value)).ThenInclude(p => p.Team)
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Positions).ThenInclude(p => p.ParentPosition)
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Matches).ThenInclude(m => m.UserMatches.Where(u => user != null && !user.IsAdminWithNoCustomEstimate(tourneyUid) && u.User == user))
                .Include(t => t.Phases).ThenInclude(p => p.Squads).ThenInclude(s => s.Matches).ThenInclude(
                    m => m.Estimates.Where(s => user != null && user.HasCustomEstimate() ? s.User == user : s.User == null)
                 )
                .Include(t => t.Phases).ThenInclude(p => p.Events.OrderBy(e => e.Time)).ThenInclude(e => e.Positions)
                .Include(t => t.Teams).ThenInclude(t => t.TeamDatas.Where(d => d.Tourney.Uid == tourneyUid))
                .Include(t => t.Teams).ThenInclude(t => t.Alias)
                //.Include(t => t.Messages.Where(m=>m.MessageType=="image").OrderByDescending(m=>m.Time))
                .FirstOrDefault(t => t.Uid == tourneyUid);

            if (tourney == null)
            {
                throw new NotFoundException("Tourney", tourneyUid);
            }
            tourney.Ranks = context.Tourneys.Include(t => t.Ranks.OrderBy(r => r.Order)).First(t => t.Uid == tourneyUid).Ranks;

            tourney.Config = GetRule(tourney);


            return tourney;
        }

        public Tourney GetTourney(string tourneyUid, CJoliContext context)
        {
            return GetTourney(tourneyUid, null, context);
        }


        private Ranking GetRanking(string tourneyUid, User? user, bool? useEstimate, CJoliContext context)
        {
            var tourney = GetTourney(tourneyUid, user, context);
            if (tourney.DisplayTime > DateTime.Now && !user.IsAdmin(tourneyUid))
            {
                tourney = new Tourney() { Uid = tourney.Uid, Name = tourney.Name };
            }
            var scores = CalculateScores(tourney, user, estimate: useEstimate);

            return new Ranking() { Tourney = tourney, Scores = scores };
        }

        public void ClearCache(string uuid, User? user, CJoliContext context)
        {
            _logger.LogInformation($"ClearCache for user:{user?.Login}");

            bool isAdmin = user.IsAdminWithNoCustomEstimate(uuid);
            if (isAdmin)
            {
                _memoryCache.Remove(uuid);
            }
            else if (user != null)
            {
                var map = _memoryCache.GetOrCreate(uuid, entry => new Dictionary<string, RankingDto>());
                map!.Remove($"{user.Login}-True");
                map!.Remove($"{user.Login}-False");
            }
        }

        private RankingDto CreateRankingImpl(string tourneyUid, string? login, bool? useEstimate, CJoliContext context)
        {
            User? user = GetUserWithConfig(login, tourneyUid, context);
            var ranking = GetRanking(tourneyUid, user, useEstimate, context);
            var dto = _mapper.Map<RankingDto>(ranking);
            AffectationTeams(dto);
            CalculateHistory(dto, ranking.Tourney);
            CalculateHistoryByTimes(dto, ranking.Tourney, context);
            CalculateAllBetScores(dto, user, context);
            return dto;
        }

        private RankingDto GetOrUpdateWithLock(string key, Func<RankingDto?> get, Func<RankingDto> update)
        {
            ReaderWriterLockSlim? cacheLock;
            if (!locks.TryGetValue(key, out cacheLock))
            {
                cacheLock = new ReaderWriterLockSlim();
                locks.TryAdd(key, cacheLock);
            }

            cacheLock.EnterUpgradeableReadLock();
            try
            {
                RankingDto? data;
                cacheLock.EnterReadLock();
                try
                {
                    data = get();
                }
                finally
                {
                    cacheLock.ExitReadLock();
                }

                if (data == null)
                {
                    cacheLock.EnterWriteLock();
                    try
                    {
                        data = get();
                        if (data == null)
                        {
                            data = update();
                        }
                    }
                    finally
                    {
                        cacheLock.ExitWriteLock();
                    }
                }
                return data;
            }
            finally
            {
                cacheLock.ExitUpgradeableReadLock();
            }
        }

        public RankingDto CreateRanking(string tourneyUid, string? login, bool? useEstimate, CJoliContext context)
        {
            Stopwatch sw = Stopwatch.StartNew();
            string loginKey = $"{login ?? "anonymous"}-{useEstimate}";

            var map = _memoryCache.GetOrCreate(tourneyUid, entry => new Dictionary<string, RankingDto>());

            var dto = GetOrUpdateWithLock($"{tourneyUid}-{loginKey}", get: () =>
            {
                return map!.GetValueOrDefault(loginKey, null);
            }, update: () =>
            {
                _logger.LogInformation($"Generate RankingDto");
                var dto = CreateRankingImpl(tourneyUid, login, useEstimate, context);
                if (!map!.ContainsKey(loginKey))
                {
                    map.Add(loginKey, dto);
                }
                else
                {
                    map.Remove(loginKey);
                    map.Add(loginKey, dto);
                }
                return dto;
            });
            _logger.LogInformation($"Time[CreateRanking]:{sw.ElapsedMilliseconds}ms");
            return dto;
        }

        public GalleryDto CreateGallery(string uuid, int page, string? login, bool waiting, bool random, CJoliContext context)
        {
            User? user = GetUserWithConfig(login, uuid, context);
            bool isAdmin = user.IsAdmin(uuid);
            if (!isAdmin)
            {
                waiting = false;
            }


            var query = context.Messages.Where(m => m.Tourney.Uid == uuid && m.MessageType == "image").OrderByDescending(m => m.Time);
            int countWaiting = query.Where(m => !m.IsPublished).Count();
            int count = query.Where(m => m.IsPublished == !waiting).Count();
            int pageSize = 12;
            List<Message> messages;
            if (random && count > pageSize)
            {
                Random rand = new Random();
                int skipper = rand.Next(0, count - pageSize);
                messages = query.Where(m => m.IsPublished == !waiting).Skip(skipper).Take(pageSize).ToList();
            }
            else
            {
                messages = query.Where(m => m.IsPublished == !waiting).Skip(pageSize * page).Take(pageSize).ToList();
            }
            var m = _mapper.Map<List<MessageDto>>(messages);
            return new GalleryDto() { Page = page, PageSize = pageSize, Total = count, TotalWaiting = countWaiting, Messages = m };
        }

        private void UpdateEstimate(string uuid, string login, CJoliContext context)
        {
            User? user = GetUserWithConfig(login, uuid, context);
            User? originalUser = user;

            bool isAdmin = user.IsAdminWithNoCustomEstimate(uuid);
            if (isAdmin)
            {
                user = null;
            }
            Tourney tourney = GetTourney(uuid, user, context);
            var scores = CalculateScores(tourney, user, estimate: true);
            _estimateService.CalculateEstimates(tourney, scores, user, context);
            ClearCache(uuid, originalUser, context);
            if (isAdmin)
            {
                _serverService.UpdateRanking(uuid);
            }
        }

        private ScoresDto CalculateScores(Tourney tourney, User? user, bool? estimate)
        {
            IRule rule = GetRule(tourney);

            var scoreTourney = new Score();
            var scoreSquads = new List<ScoreSquad>();
            var scorePhases = new Dictionary<int, List<Score>>();
            var phases = tourney.Phases;
            phases.Sort((a, b) => a.Id < b.Id ? -1 : 1);
            foreach (var phase in phases)
            {
                var scorePhase = new List<Score>();
                foreach (var squad in phase.Squads)
                {
                    var scoreSquad = CalculateScoreSquad(squad, scoreTourney, scoreSquads, scorePhases, user, estimate);
                    scoreSquads.Add(scoreSquad);
                    scorePhase.AddRange(scoreSquad.Scores.Select(s => s.Clone()));
                }
                scorePhase.Sort(rule.ScoreComparison(phase, null));
                for (int i = 0; i < scorePhase.Count; i++)
                {
                    var score = scorePhase[i];
                    score.Rank = i + 1;
                    var scoreBefore = i > 0 ? scorePhase[i - 1] : null;
                    if (scoreBefore != null && score.Sources[scoreBefore.PositionId]?.Type == SourceType.equal)
                    {
                        score.Rank = scoreBefore.Rank;
                    }
                }

                scorePhases.Add(phase.Id, scorePhase);
            }

            return new ScoresDto { ScoreSquads = scoreSquads, ScoreTourney = scoreTourney, ScorePhases = scorePhases, Bet = new BetDto() };
        }

        public static void UpdateSource(Score a, Score b, SourceType type, double value, bool positive)
        {
            if (a.Sources.ContainsKey(b.PositionId))
            {
                a.Sources[b.PositionId] = new ScoreSource { Type = type, Value = value, Winner = (positive && value >= 0) || (!positive && value < 0) };
            }
            else
            {
                a.Sources.Add(b.PositionId, new ScoreSource { Type = type, Value = value, Winner = (positive && value >= 0) || (!positive && value < 0) });
            }
            if (b.Sources.ContainsKey(a.PositionId))
            {
                b.Sources[a.PositionId] = new ScoreSource { Type = type, Value = -value, Winner = (positive && -value >= 0) || (!positive && -value < 0) };
            }
            else
            {
                b.Sources.Add(a.PositionId, new ScoreSource { Type = type, Value = -value, Winner = (positive && -value >= 0) || (!positive && -value < 0) });
            }
        }

        public Func<Phase, Squad?, Comparison<Score>> DefaultScoreComparison = (Phase phase, Squad? squad) => (Score a, Score b) =>
        {
            var positions = squad?.Positions ?? phase.Squads.SelectMany(s => s.Positions).ToList();
            var matches = squad?.Matches ?? phase.Squads.SelectMany(s => s.Matches).ToList();

            var positionA = positions.Single(p => p.Id == a.PositionId);
            var positionB = positions.Single(p => p.Id == b.PositionId);


            var diff = a.Total.CompareTo(b.Total);
            if (diff != 0)
            {
                UpdateSource(a, b, SourceType.total, a.Total - b.Total, true);
                return -diff;
            }

            var match = matches.OrderBy(m => m.Time).LastOrDefault(m => (m.PositionA == positionA && m.PositionB == positionB) || (m.PositionB == positionA && m.PositionA == positionB));
            if (match != null)
            {
                var userMatch = match.UserMatches.FirstOrDefault(u => u.User != null);
                IMatch m = match.Done ? match : userMatch != null ? userMatch : match;
                if (m.ScoreA > m.ScoreB || m.ForfeitB)
                {
                    int result = match.PositionA == positionA ? -1 : 1;
                    UpdateSource(a, b, SourceType.direct, -result, true);
                    return result;
                }
                else if (m.ScoreB > m.ScoreA || m.ForfeitA)
                {
                    int result = match.PositionB == positionA ? -1 : 1;
                    UpdateSource(a, b, SourceType.direct, -result, true);
                    return result;
                }
            }
            diff = a.GoalDiff.CompareTo(b.GoalDiff);
            if (diff != 0)
            {
                UpdateSource(a, b, SourceType.goalDiff, a.GoalDiff - b.GoalDiff, true);
                return -diff;
            }
            diff = a.GoalFor.CompareTo(b.GoalFor);
            if (diff != 0)
            {
                UpdateSource(a, b, SourceType.goalFor, a.GoalFor - b.GoalFor, true);
                return -diff;
            }
            diff = a.GoalAgainst.CompareTo(b.GoalAgainst);
            if (diff != 0)
            {
                UpdateSource(a, b, SourceType.goalAgainst, b.GoalAgainst - a.GoalAgainst, false);
                return diff;
            }
            var teamA = positionA.Team;
            var teamB = positionB.Team;
            if (teamA != null && teamB != null)
            {
                int result = -teamA.Youngest?.CompareTo(teamB.Youngest) ?? 0;
                if (result != 0)
                {
                    UpdateSource(a, b, SourceType.youngest, result, false);
                    return result;
                }
            }
            UpdateSource(a, b, SourceType.equal, 0, true);
            return positionA.Value < positionB.Value ? -1 : 1;
        };

        public Action<Match, MatchDto> DefaultApplyForfeit = (Match match, MatchDto dto) =>
        {
            match.ForfeitA = dto.ForfeitA;
            match.ForfeitB = dto.ForfeitB;
            match.ScoreA = 0;
            match.ScoreB = 0;
        };


        private ScoreSquad CalculateScoreSquad(Squad squad, Score scoreTourney, List<ScoreSquad> scoreSquads, Dictionary<int, List<Score>> scorePhases, User? user, bool? estimate)
        {
            Dictionary<Models.MatchType, int> coefBracket = new Dictionary<Models.MatchType, int>() {
                { Models.MatchType.Final, 1 },
                { Models.MatchType.Semi, 2 },
                { Models.MatchType.Quarter, 4 },
                { Models.MatchType.Match8, 8 },
                { Models.MatchType.Match16, 16 },
                { Models.MatchType.Match32, 32 },
            };

            IRule rule = GetRule(squad.Phase.Tourney);
            Dictionary<int, Score> scores = rule.InitScoreSquad(squad, scoreSquads, scorePhases, user);
            if (squad.Type == SquadType.Bracket)
            {
                squad.Positions.Where(p => p.MatchType == Models.MatchType.Semi).ToDictionary(p => p.Id, p => new Score() { PositionId = p.Id, TeamId = p.Team?.Id ?? 0 });
            }
            squad.Matches.Aggregate(scores, (acc, m) =>
            {
                var userMatch = m.UserMatches.OrderByDescending(u => u.LogTime).FirstOrDefault(u => u.User == user);
                bool useCustom = user != null && user.HasCustomEstimate();

                if ((userMatch == null || !useCustom) && !m.Done)
                {
                    var estimateMatch = m.Estimates.FirstOrDefault();
                    if (estimateMatch != null && estimate.HasValue && estimate.Value)
                    {
                        userMatch = new UserMatch() { Match = m, ScoreA = estimateMatch.ScoreA, ScoreB = estimateMatch.ScoreB };
                    }
                    else
                    {
                        return acc;
                    }
                }
                IMatch match = m.Done ? m : userMatch!;
                var scoreA = acc[m.PositionA.Id];
                var scoreB = acc[m.PositionB.Id];
                UpdateScore(scoreA, scoreB, scoreTourney, match, m, rule);
                if (squad.Type == SquadType.Bracket)
                {
                    scoreA.Total = scoreA.Win > 0 ? coefBracket[m.MatchType] : 0;
                    scoreB.Total = scoreB.Win > 0 ? coefBracket[m.MatchType] : 0;
                }
                return acc;
            });
            var listScores = scores.Select(kv => kv.Value).OrderByDescending(x => x.Total).ToList();
            listScores = listScores.Select(s =>
            {
                Position? position = squad.Positions.Single(p => p.Id == s.PositionId);
                s.Total = Math.Round(s.Total - position.Penalty, 1);
                //s.Penalty = position.Penalty;
                return s;
            }).ToList();

            if (squad.Type == SquadType.Bracket)
            {
                var dico = listScores.Aggregate(new Dictionary<int, Score>(), (acc, score) =>
                {
                    if (!acc.ContainsKey(score.TeamId))
                    {
                        acc.Add(score.TeamId, new Score() { TeamId = score.TeamId });
                    }
                    acc[score.TeamId].Total += score.Total;
                    acc[score.TeamId].PositionId = score.PositionId;
                    return acc;
                });
                listScores = dico.Select(kv => kv.Value).ToList();
            }

            listScores.Sort(rule.ScoreComparison(squad.Phase, squad));
            for (int i = 0; i < listScores.Count; i++)
            {
                var score = listScores[i];
                score.Rank = i + 1;
                var scoreBefore = i > 0 ? listScores[i - 1] : null;
                if (scoreBefore != null && score.Sources[scoreBefore.PositionId]?.Type == SourceType.equal)
                {
                    score.Rank = scoreBefore.Rank;
                }
            }


            var scoreSquad = new ScoreSquad() { SquadId = squad.Id, Scores = listScores };
            return scoreSquad;
        }

        private void CalculateBetScore(Match match, UserMatch userMatch)
        {
            int score = 0;
            if (userMatch.LogTime > match.Time && userMatch.User != null)
            {
                return;
            }
            if (match.ScoreA == userMatch.ScoreA && match.ScoreB == userMatch.ScoreB)
            {
                userMatch.BetScore = 10;
                userMatch.BetPerfect = true;
                return;
            }
            int diffMatch = match.ScoreA - match.ScoreB;
            int diffUserMatch = userMatch.ScoreA - userMatch.ScoreB;
            if (diffMatch * diffUserMatch > 0 || diffMatch == diffUserMatch)
            {
                userMatch.BetWinner = true;
                score += 5;
            }
            if (diffMatch == diffUserMatch && diffMatch != 0)
            {
                userMatch.BetDiff = true;
                score += 2;
            }
            if (match.ScoreA == userMatch.ScoreA)
            {
                userMatch.BetGoal = true;
                score += 1;
            }
            if (match.ScoreB == userMatch.ScoreB)
            {
                userMatch.BetGoal = true;
                score += 1;
            }
            userMatch.BetScore = score;
        }


        private void AffectationTeams(RankingDto ranking)
        {
            var squads = ranking.Tourney.Phases.SelectMany(p => p.Squads);
            var positions = squads.SelectMany(s => s.Positions);
            var matches = squads.SelectMany(s => s.Matches);

            foreach (var position in positions.Where(p => p.ParentPosition != null))
            {
                List<Score> scores;
                if (position.ParentPosition!.SquadId > 0)
                {
                    var scoreSquad = ranking.Scores.ScoreSquads.Find(s => s.SquadId == position.ParentPosition!.SquadId);
                    scores = scoreSquad?.Scores ?? new List<Score>();
                }
                else
                {
                    scores = ranking.Scores.ScorePhases[position.ParentPosition!.PhaseId];
                }
                var score = scores[(position.ParentPosition?.Value ?? 1) - 1];
                if (score != null && score.Game > 0)
                {
                    var positionParent = positions.Single(p => p.Id == score.PositionId);
                    position.TeamId = positionParent.TeamId;
                }
                else
                {
                    position.TeamId = 0;
                }
            }
            foreach (var position in positions.Where(p => p.MatchType != 0))
            {
                var m = matches.SingleOrDefault(m => m.SquadId == position.SquadId && m.MatchType == position.MatchType && m.MatchOrder == position.MatchOrder);
                //var m = matches.FirstOrDefault(m => m.SquadId == position.SquadId && m.MatchType == position.MatchType && m.MatchOrder == position.MatchOrder);
                var userMatch = m?.UserMatch;
                IMatch? match = m != null && m.Done ? m : userMatch;
                if (match != null)
                {
                    var positionId = 0;
                    if (position.Winner)
                    {
                        positionId = match.ScoreA > match.ScoreB || match.ForfeitB || match.WinnerA ? m.PositionIdA : m.PositionIdB;
                    }
                    else
                    {
                        positionId = match.ScoreA > match.ScoreB || match.ForfeitB || match.WinnerA ? m.PositionIdB : m.PositionIdA;
                    }
                    var positionParent = positions.Single(p => p.Id == positionId);
                    position.TeamId = positionParent.TeamId;
                }
            }
            foreach (var match in matches)
            {
                match.TeamIdA = positions.Single(p => p.Id == match.PositionIdA).TeamId;
                match.TeamIdB = positions.Single(p => p.Id == match.PositionIdB).TeamId;
            }
            //Assign rank
            foreach (var rank in ranking.Tourney.Ranks)
            {
                var squad = squads.Single(s => s.Id == rank.SquadId);
                if (squad.Type == SquadType.Bracket)
                {
                    //TODO
                }
                else
                {
                    var scoreSquad = ranking.Scores.ScoreSquads.SingleOrDefault(s => s.SquadId == rank.SquadId);
                    if (scoreSquad != null)
                    {
                        var score = scoreSquad.Scores[rank.Value - 1];
                        rank.TeamId = positions.Single(p => p.Id == score.PositionId).TeamId;
                    }
                }
            }
        }

        private void CalculateHistory(RankingDto ranking, Tourney tourney)
        {

            var mapTeams = ranking.Tourney.Teams.ToDictionary(t => t.Id, t => new List<Score>());

            var teams = ranking.Tourney.Teams;
            var positions = ranking.Tourney.Phases.SelectMany(p => p.Squads).SelectMany(s => s.Positions);
            var matches = ranking.Tourney.Phases.SelectMany(p => p.Squads).SelectMany(s => s.Matches).Where(m => m.Done || m.UserMatch != null).OrderBy(m => m.Time);
            matches.Aggregate(mapTeams, (acc, m) =>
            {
                var positionA = positions.SingleOrDefault(p => p.Id == m.PositionIdA);
                var positionB = positions.SingleOrDefault(p => p.Id == m.PositionIdB);
                if (positionA == null || positionB == null)
                {
                    return acc;
                }
                var teamA = teams.SingleOrDefault(t => t.Id == positionA.TeamId);
                var teamB = teams.SingleOrDefault(t => t.Id == positionB.TeamId);
                if (teamA == null || teamB == null)
                {
                    return acc;
                }

                var listA = acc[teamA.Id];
                var listB = acc[teamB.Id];
                var scoreA = new Score() { TeamId = teamA.Id };
                var scoreB = new Score() { TeamId = teamB.Id };

                IMatch match = m.Done ? m : m.UserMatch != null ? m.UserMatch : m;

                IRule rule = GetRule(tourney);
                UpdateScore(scoreA, scoreB, null, match, m, rule);

                if (listA.Count > 0)
                {
                    scoreA.Merge(listA.Last());
                }
                if (listB.Count > 0)
                {
                    scoreB.Merge(listB.Last());
                }
                listA.Add(scoreA);
                listB.Add(scoreB);
                return acc;
            });
            var scoreTeams = mapTeams.ToDictionary(kv => kv.Key, kv => kv.Value.LastOrDefault() ?? new Score() { TeamId = kv.Key });
            SortTeams(scoreTeams);
            ranking.History = mapTeams;
            ranking.Scores.ScoreTeams = scoreTeams;
        }

        class IMatchResultt
        {
            public int Win;
            public int Loss;
            public int Neutral;
            public int GoalFor;
            public int GoalAgainst;
            public int GoalDiff;
            public int ShutOut;
            public Match? Match;
        }

        private void CalculateHistoryByTimes(RankingDto ranking, Tourney tourney, CJoliContext context)
        {
            var query = context.MatchResult.Where(r => r.Match.Squad!.Phase.Tourney.Category == tourney.Category && (r.Win == 1 || r.Neutral == 1));
            var queryMatchAll = query
                .Select(r => new MatchResultBase() { Win = r.Win, Loss = r.Loss, Neutral = r.Neutral, GoalFor = r.GoalFor, GoalAgainst = r.GoalAgainst, GoalDiff = r.GoalDiff, Match = r.Match, ShutOut = r.ShutOut }).Distinct();
            var queryMatchAllSeason = query.Where(r => r.Match.Squad!.Phase.Tourney.Season == tourney.Season)
                .Select(r => new MatchResultBase() { Win = r.Win, Loss = r.Loss, Neutral = r.Neutral, GoalFor = r.GoalFor, GoalAgainst = r.GoalAgainst, GoalDiff = r.GoalDiff, Match = r.Match, ShutOut = r.ShutOut }).Distinct();

            var func = (IQueryable<IMatchResult> query) =>
            {
                Score score = query.GroupBy(r => 1).Select(ISelectScore).SingleOrDefault() ?? new Score();
                return score;
            };

            Score scoreTotal = func(queryMatchAll);
            Score scoreTotalSeason = func(queryMatchAllSeason);

            ranking.Scores.ScoreAllTime = scoreTotal;
            ranking.Scores.ScoreSeason = scoreTotalSeason;



            var teamIds = tourney.Teams.Select(t => t.Id);
            var queryMatch = context.MatchResult.Where(r => r.Match.Squad!.Phase.Tourney.Category == tourney.Category && teamIds.Contains(r.Team.Id));
            var queryMatchSeason = queryMatch.Where(r => r.Match.Squad!.Phase.Tourney.Season == tourney.Season);

            var funcMap = (IQueryable<MatchResult> query) =>
            {
                var mapScore = query
                    .GroupBy(r => r.Team.Id)
                    .ToDictionary(kv => kv.Key, kv => ISelectScore(kv)) ?? new Dictionary<int, Score>();
                return mapScore;
            };
            var mapAllTeam = funcMap(queryMatch);
            var mapAllTeamSeason = funcMap(queryMatchSeason);

            tourney.Teams.ToList().ForEach(t =>
            {
                if (!mapAllTeam.ContainsKey(t.Id))
                {
                    mapAllTeam.Add(t.Id, new Score() { TeamId = t.Id });
                }
                if (!mapAllTeamSeason.ContainsKey(t.Id))
                {
                    mapAllTeamSeason.Add(t.Id, new Score() { TeamId = t.Id });
                }

            });

            SortTeams(mapAllTeam);
            SortTeams(mapAllTeamSeason);


            ranking.Scores.ScoreTeamsAllTime = mapAllTeam;
            ranking.Scores.ScoreTeamsSeason = mapAllTeamSeason;

        }

        private Score ISelectScore(IGrouping<int, IMatchResult> o)
        {
            return new Score
            {
                TeamId = o.Key,
                Game = o.Count(),
                Win = o.Sum(m => m.Win),
                Neutral = o.Sum(m => m.Neutral),
                Loss = o.Sum(m => m.Loss),
                GoalFor = o.Sum(m => m.GoalFor),
                GoalAgainst = o.Sum(m => m.GoalAgainst),
                GoalDiff = o.Sum(m => m.GoalDiff),
                ShutOut = o.Sum(m => m.ShutOut)
            };
        }



        private void CalculateAllBetScores(RankingDto ranking, User? user, CJoliContext context)
        {
            var source = _configuration["Source"];
            int tourneyId = ranking.Tourney.Id;
            var query = context.UserMatch
                .Where(u => u.Match.Squad!.Phase.Tourney.Id == tourneyId && u.Match.Done && (u.User!.Source == source || u.User == null))
                .Include(u => u.User).ThenInclude(u => u != null ? u.Configs : null);
            var scores = query
                .GroupBy(u => u.User).Select(kv =>
                    new BetScoreDto
                    {
                        UserId = kv.Key != null ? kv.Key.Id : 0,
                        Score = kv.Sum(u => u.BetScore),
                        Perfect = kv.Count(u => u.BetPerfect),
                        Winner = kv.Count(u => u.BetWinner),
                        Diff = kv.Count(u => u.BetDiff),
                        Goal = kv.Count(u => u.BetGoal)
                    }).OrderByDescending(s => s.Score).ToList();
            ranking.Scores.Bet.Scores = scores;
            var allUsers = scores.Select(s => s.UserId);
            //ranking.Scores.Bet.Users = context.Users.Where(u=>allUsers.Contains(u.Id)).Select(u => _mapper.Map<UserDto>(u)).ToList();
            ranking.Scores.Bet.Users = _mapper.Map<List<UserDto>>(context.Users.Include(c => c.Configs.Where(c => c.Tourney.Id == tourneyId)).Where(u => allUsers.Contains(u.Id)).ToList());

            int index = scores.FindIndex(s => s.UserId == user?.Id);
            List<int> users = scores.Where((s, i) => i < 3 || s.UserId == 0 || Math.Abs(index - i) < 3).Select(s => s.UserId).ToList();

            var userMatches = query.Where(u => u.User == null || users.Contains(u.User.Id)).ToList();


            var mapUsers = users.ToDictionary(t => t, t => new List<BetScoreDto>());

            var matches = ranking.Tourney.Phases.SelectMany(p => p.Squads).SelectMany(s => s.Matches).Where(m => m.Done).OrderBy(m => m.Time);
            matches.Aggregate(mapUsers, (acc, m) =>
            {
                var currentUserMatches = userMatches.Where(u => u.Match.Id == m.Id).ToList();
                foreach (var current in currentUserMatches)
                {
                    var list = acc[current.User?.Id ?? 0];
                    var bet = new BetScoreDto
                    {
                        UserId = current.User != null ? current.User.Id : 0,
                        Score = current.BetScore,
                        Perfect = current.BetPerfect ? 1 : 0,
                        Winner = current.BetWinner ? 1 : 0,
                        Diff = current.BetDiff ? 1 : 0,
                        Goal = current.BetGoal ? 1 : 0,
                        Time = m.Time
                    };
                    if (list.Count > 0)
                    {
                        var last = list.Last();
                        bet.Score += last.Score;
                        bet.Perfect += last.Perfect;
                        bet.Winner += last.Winner;
                        bet.Diff += last.Diff;
                        bet.Goal += last.Goal;
                    }
                    list.Add(bet);

                }
                return acc;
            });

            ranking.Scores.Bet.History = mapUsers;



        }

        public class ColumnDef
        {
            public required string Type;
            public required Func<Score, int> Val;
            public bool Reverse;
        }

        private void SortTeams(Dictionary<int, Score> scoreTeams)
        {
            var listScores = scoreTeams.Values.ToList();
            var columns = new List<ColumnDef>{
            new ColumnDef{
                Type="win",
                Val=(Score s)=>s.Win,
                Reverse=false,
            },
            new ColumnDef{
                Type="neutral",
                Val=(Score s)=>s.Neutral,
                Reverse=false,
            },
            new ColumnDef{
                Type="loss",
                Val=(Score s)=>s.Loss,
                Reverse=true,
            },
            new ColumnDef{
                Type="goalFor",
                Val=(Score s)=>s.GoalFor,
                Reverse=false,
            },
            new ColumnDef{
                Type="goalAgainst",
                Val=(Score s)=>s.GoalAgainst,
                Reverse=true,
            },
            new ColumnDef{
                Type="shutOut",
                Val=(Score s)=>s.ShutOut,
                Reverse=false,
            },
            new ColumnDef{
                Type="goalDiff",
                Val=(Score s)=>s.GoalDiff,
                Reverse=false,
            },
            new ColumnDef{
                Type="penalty",
                Val=(Score s)=>s.Penalty,
                Reverse=true,
            },
            };
            listScores.ForEach(score =>
            {
                int teamId = score.TeamId;
                var mapResult = columns.Aggregate(new Dictionary<string, RankInfo>(), (acc, c) =>
                {
                    var tmp = new List<Score>(listScores);
                    tmp.Sort((a, b) =>
                    {
                        if (a.Game == 0 && b.Game == 0)
                        {
                            return a.TeamId < b.TeamId ? -1 : 1;
                        }
                        if (a.Game == 0)
                        {
                            return -1;
                        }
                        if (b.Game == 0)
                        {
                            return 1;
                        }
                        var valueA = (double)c.Val(a) / a.Game;
                        var valueB = (double)c.Val(b) / b.Game;
                        if (valueA > valueB) return c.Reverse ? 1 : -1;
                        else if (valueA < valueB) return c.Reverse ? -1 : 1;
                        else if (a.TeamId == teamId) return -1;
                        else if (b.TeamId == teamId) return 1;
                        return 1;
                    });
                    int rank = tmp.FindIndex(s => s.TeamId == teamId);

                    var filterTmp = tmp.Where(s => s.Game > 0).ToList();
                    if (filterTmp.Count > 0)
                    {
                        int max = c.Reverse ? c.Val(filterTmp[filterTmp.Count - 1]) : c.Val(filterTmp[0]);
                        double maxRatio = 0;
                        if ((c.Reverse && filterTmp[filterTmp.Count - 1].Game > 0) || (!c.Reverse && filterTmp[0].Game > 0))
                        {
                            maxRatio = c.Reverse ? (double)c.Val(filterTmp[filterTmp.Count - 1]) / filterTmp[filterTmp.Count - 1].Game : (double)c.Val(filterTmp[0]) / filterTmp[0].Game;
                        }
                        int min = c.Reverse ? c.Val(filterTmp[0]) : c.Val(filterTmp[filterTmp.Count - 1]);
                        double minRatio = 0;
                        if ((c.Reverse && filterTmp[0].Game > 0) || (!c.Reverse && filterTmp[filterTmp.Count - 1].Game > 0))
                        {
                            minRatio = c.Reverse ? (double)c.Val(filterTmp[0]) / filterTmp[0].Game : (double)c.Val(filterTmp[filterTmp.Count - 1]) / filterTmp[filterTmp.Count - 1].Game;
                        }
                        acc[c.Type] = new RankInfo { Rank = rank, Min = min, Max = max, MinRatio = minRatio, MaxRatio = maxRatio };
                    }
                    else
                    {
                        acc[c.Type] = new RankInfo { Rank = rank, Min = 0, Max = 0, MinRatio = 0, MaxRatio = 0 };
                    }

                    return acc;
                });
                scoreTeams[teamId].Ranks = mapResult;
            });
        }

        public enum ScoreType
        {
            Win,
            Loss,
            Neutral,
            Forfeit
        }

        public double Total(ScoreType type, IRule rule, double total, int score)
        {
            switch (type)
            {
                case ScoreType.Win:
                    return total + rule.Win;
                case ScoreType.Loss:
                    return total + rule.Loss;
                case ScoreType.Neutral:
                    return total + rule.Neutral;
                case ScoreType.Forfeit:
                    return total + rule.Forfeit;
            }
            return total;
        }

        public void UpdateScore(Score scoreA, Score scoreB, Score? scoreTourney, IMatch match, IPenalty penalty, IRule rule)
        {
            scoreA.Time = match.Time;
            scoreB.Time = match.Time;

            scoreA.Game++;
            scoreB.Game++;
            scoreA.Penalty += penalty.PenaltyA;
            scoreB.Penalty += penalty.PenaltyB;
            if (scoreTourney != null)
            {
                scoreTourney.Game++;
            }

            bool isForfeit = match.ForfeitA || match.ForfeitB;
            if (match.ScoreA > match.ScoreB || match.ForfeitB || match.WinnerA)
            {
                scoreA.Win++;
                scoreB.Loss++;

                scoreA.Total = rule.Total(ScoreType.Win, scoreA.Total, match.ScoreA);
                scoreB.Total = rule.Total(match.ForfeitB ? ScoreType.Forfeit : ScoreType.Loss, scoreB.Total, match.ScoreB);

                if (scoreTourney != null)
                {
                    scoreTourney.Win++;
                    scoreTourney.GoalFor += match.ScoreA;
                    scoreTourney.GoalAgainst += match.ScoreB;
                    scoreTourney.GoalDiff += match.ScoreA - match.ScoreB;
                    scoreTourney.ShutOut += !isForfeit && match.ScoreB == 0 ? 1 : 0;
                }
            }
            else if (match.ScoreA < match.ScoreB || match.ForfeitA || match.WinnerB)
            {
                scoreA.Loss++;
                scoreB.Win++;

                scoreA.Total = rule.Total(match.ForfeitA ? ScoreType.Forfeit : ScoreType.Loss, scoreA.Total, match.ScoreA);
                scoreB.Total = rule.Total(ScoreType.Win, scoreB.Total, match.ScoreB);

                if (scoreTourney != null)
                {
                    scoreTourney.Win++;
                    scoreTourney.GoalFor += match.ScoreB;
                    scoreTourney.GoalAgainst += match.ScoreA;
                    scoreTourney.ShutOut += !isForfeit && match.ScoreA == 0 ? 1 : 0;
                }
            }
            else
            {
                scoreA.Neutral++;
                scoreB.Neutral++;

                scoreA.Total = rule.Total(ScoreType.Neutral, scoreA.Total, match.ScoreA);
                scoreB.Total = rule.Total(ScoreType.Neutral, scoreB.Total, match.ScoreB);

                if (scoreTourney != null)
                {
                    scoreTourney.Neutral++;
                    scoreTourney.GoalFor += match.ScoreA;
                    scoreTourney.GoalAgainst += match.ScoreB;
                    scoreTourney.ShutOut += !isForfeit && match.ScoreA == 0 ? 1 : 0;
                }
            }
            scoreA.GoalFor += match.ScoreA;
            scoreA.GoalAgainst += match.ScoreB;
            scoreA.GoalDiff += match.ScoreA - match.ScoreB;
            scoreA.ShutOut += !isForfeit && match.ScoreB == 0 ? 1 : 0;

            scoreB.GoalFor += match.ScoreB;
            scoreB.GoalAgainst += match.ScoreA;
            scoreB.GoalDiff += match.ScoreB - match.ScoreA;
            scoreB.ShutOut += !isForfeit && match.ScoreA == 0 ? 1 : 0;

        }


        public void SaveMatch(MatchDto dto, string login, string uuid, CJoliContext context)
        {
            var source = _configuration["Source"];

            User user = GetUserWithConfigMatch(login, uuid, context);
            Match? match = context.Match
                .Include(m => m.PositionA).ThenInclude(p => p.Team).ThenInclude(t => t != null ? t.MatchResults : null)
                .Include(m => m.PositionB).ThenInclude(p => p.Team).ThenInclude(t => t != null ? t.MatchResults : null)
                .Include(m => m.UserMatches.Where(u => u.User == null || u.User.Source == source)).ThenInclude(u => u.User)
                .Include(m => m.Squad).ThenInclude(s => s.Phase).ThenInclude(p => p.Tourney)
                .Include(m => m.Estimates.Where(e => e.User == null))
                .SingleOrDefault(m => m.Id == dto.Id);
            if (match == null)
            {
                throw new NotFoundException("Match", dto.Id);
            }
            bool isAdmin = user.IsAdminWithNoCustomEstimate(uuid);
            IRule rule = GetRule(match.Squad!.Phase.Tourney);
            if (isAdmin)
            {
                match.Done = true;
                if (dto.ForfeitA || dto.ForfeitB)
                {
                    rule.ApplyForfeit(match, dto);
                }
                else
                {
                    match.ScoreA = dto.ScoreA;
                    match.ScoreB = dto.ScoreB;
                }
                SaveMatchResult(match.PositionA, match.PositionB, match, match.ScoreA, match.ScoreB);
                SaveMatchResult(match.PositionB, match.PositionA, match, match.ScoreB, match.ScoreA);

                var estimate = match.Estimates.FirstOrDefault(e => e.User == null);
                if (estimate != null)
                {
                    var dtoBot = new MatchDto { Id = match.Id, ScoreA = estimate.ScoreA, ScoreB = estimate.ScoreB };
                    UpsertUserMatch(dtoBot, match, null);
                }

                foreach (var userMatch in match.UserMatches)
                {
                    CalculateBetScore(match, userMatch);
                }
            }
            else
            {
                UpsertUserMatch(dto, match, user);
            }
            context.SaveChanges();
            ClearCache(uuid, user, context);
            RunThread((CJoliContext context) => UpdateEstimate(uuid, login, context), context);
        }

        public void UpdateMatch(MatchDto dto, string login, string uuid, CJoliContext context)
        {
            var source = _configuration["Source"];

            User user = GetUserWithConfigMatch(login, uuid, context);
            Match? match = context.Match.SingleOrDefault(m => m.Id == dto.Id);
            if (match == null)
            {
                throw new NotFoundException("Match", dto.Id);
            }
            bool isAdmin = user.IsAdminWithNoCustomEstimate(uuid);
            if (isAdmin)
            {
                match.PenaltyA = dto.PenaltyA;
                match.PenaltyB = dto.PenaltyB;
            }
            context.SaveChanges();
            ClearCache(uuid, user, context);
        }


        private void RunThread(Action<CJoliContext> callback, CJoliContext context)
        {
            if (_configuration.GetValue<string>("IsTesting") == "true")
            {
                callback(context);
            }
            else
            {
                var thread = new Thread(new ThreadStart(() =>
                {
                    using (var scope = _service.CreateScope())
                    {
                        var context = scope.ServiceProvider.GetService<CJoliContext>();
                        if (context != null)
                        {
                            callback(context);
                        }
                    }
                }));
                thread.Start();
            }
        }

        private void UpsertUserMatch(MatchDto dto, Match match, User? user)
        {
            UserMatch? userMatch = match.UserMatches.OrderByDescending(u => u.LogTime).FirstOrDefault(u => u.User == user);
            if (userMatch == null)
            {
                userMatch = new UserMatch() { Match = match, User = user };
                match.UserMatches.Add(userMatch);
            }
            if (dto.ForfeitA || dto.ForfeitB)
            {
                userMatch.ForfeitA = dto.ForfeitA;
                userMatch.ForfeitB = dto.ForfeitB;
                userMatch.ScoreA = 0;
                userMatch.ScoreB = 0;
            }
            userMatch.ScoreA = dto.ScoreA;
            userMatch.ScoreB = dto.ScoreB;
            userMatch.LogTime = DateTime.Now;
        }

        public void ClearMatch(MatchDto dto, string login, string uuid, CJoliContext context)
        {
            Stopwatch sw = Stopwatch.StartNew();
            User user = GetUserWithConfigMatch(login, uuid, context);
            Match? match = context.Match
                .Include(m => m.UserMatches.Where(u => u.User == user))
                .Include(m => m.PositionA).ThenInclude(p => p.Team).ThenInclude(t => t != null ? t.MatchResults : null)
                .Include(m => m.PositionB).ThenInclude(p => p.Team).ThenInclude(t => t != null ? t.MatchResults : null)
                .Include(m => m.UserMatches)
                .SingleOrDefault(m => m.Id == dto.Id);

            if (match == null)
            {
                throw new NotFoundException("Match", dto.Id);
            }
            bool isAdmin = user.IsAdminWithNoCustomEstimate(uuid);
            if (isAdmin && match.Done)
            {
                match.Done = false;
                match.ScoreA = 0;
                match.ScoreB = 0;
                match.ForfeitA = false;
                match.ForfeitB = false;

                foreach (var matchResult in match.MatchResults)
                {
                    context.Remove(matchResult);
                }
                foreach (var userMatch in match.UserMatches)
                {
                    userMatch.BetScore = 0;
                    userMatch.BetPerfect = false;
                    userMatch.BetWinner = false;
                    userMatch.BetDiff = false;
                    userMatch.BetGoal = false;
                }
            }
            else
            {
                List<UserMatch> userMatches = match.UserMatches.Where(u => u.User == user).ToList();
                foreach (var userMatch in userMatches)
                {
                    context.Remove(userMatch);
                }
            }
            context.SaveChanges();
            ClearCache(uuid, user, context);
            RunThread((CJoliContext context) => UpdateEstimate(uuid, login, context), context);

            if (user.IsAdmin(uuid))
            {
                _serverService.UpdateRanking(uuid);
            }
            _logger.LogInformation($"Time[ClearMatch]:{sw.ElapsedMilliseconds}ms");

        }

        private void SaveMatchResult(Position position, Position positionAgainst, Match match, int scoreA, int scoreB)
        {
            Team? team = position.Team;
            Team? teamAgainst = positionAgainst.Team;
            if (team == null || teamAgainst == null || match.ForfeitA || match.ForfeitB)
            {
                return;
            }
            MatchResult? matchResult = team.MatchResults.SingleOrDefault(m => m.Match == match);
            if (matchResult == null)
            {
                matchResult = new MatchResult() { Team = team, TeamAgainst = teamAgainst, Match = match };
                team.MatchResults.Add(matchResult);
            }
            matchResult.Win = scoreA > scoreB ? 1 : 0;
            matchResult.Neutral = scoreA == scoreB ? 1 : 0;
            matchResult.Loss = scoreA < scoreB ? 1 : 0;
            matchResult.GoalFor = scoreA;
            matchResult.GoalAgainst = scoreB;
            matchResult.GoalDiff = scoreA - scoreB;
            matchResult.ShutOut = scoreB == 0 ? 1 : 0;
        }

        public void SaveUserConfig(string uuid, string? login, UserConfigDto dto, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys.Include(t => t.Teams).SingleOrDefault(t => t.Uid == uuid);
            if (tourney == null)
            {
                throw new NotFoundException("Touney", uuid);
            }
            User? user = GetUserWithConfig(login, uuid, context);
            if (user == null)
            {
                throw new NotFoundException("User", login ?? "no login");
            }
            _userService.SaveUserConfig(tourney, user, dto, context);
            ClearCache(uuid, user, context);
        }

        public void UpdateEvent(string uuid, string? login, EventDto dto, CJoliContext context)
        {
            User? user = GetUserWithConfig(login, uuid, context);
            Event evt = context.Event.Single(e => e.Id == dto.Id);
            evt.Datas = dto.Datas;
            context.SaveChanges();
            ClearCache(uuid, user, context);
            _serverService.UpdateRanking(uuid);
        }


        public void ClearSimulations(int[] ids, string login, string uuid, CJoliContext context)
        {
            User user = GetUserWithConfigMatch(login, uuid, context);
            var userMatches = user.UserMatches.Where(u => ids.Contains(u.Id));
            foreach (var userMatch in userMatches)
            {
                context.Remove(userMatch);
            }
            context.SaveChanges();
            ClearCache(uuid, user, context);
        }

        public void UpdatePosition(string uuid, PositionDto positionDto, CJoliContext context)
        {
            Position position = context.Position.Single(p => p.Id == positionDto.Id);
            position.Penalty = positionDto.Penalty;
            context.SaveChanges();
            _memoryCache.Remove(uuid);
        }

        public Team UpdateTeam(string uuid, TeamDto teamDto, CJoliContext context)
        {
            Tourney? tourney = context.Tourneys.Include(t => t.Teams).ThenInclude(t => t.TeamDatas.Where(d => d.Tourney.Uid == uuid)).SingleOrDefault(t => t.Uid == uuid);
            if (tourney == null)
            {
                throw new NotFoundException("Tourney", uuid);
            }
            Team? team = tourney.Teams.SingleOrDefault(t => t.Id == teamDto.Id);
            if (team == null)
            {
                throw new NotFoundException("Team", teamDto.Id);
            }
            team.Name = teamDto.Name ?? team.Name;
            team.Logo = teamDto.Logo ?? team.Logo;
            team.Youngest = teamDto.Youngest ?? team.Youngest;
            team.ShortName = teamDto.ShortName ?? team.ShortName;
            team.FullName = teamDto.FullName ?? team.FullName;
            team.Alias = !string.IsNullOrEmpty(teamDto.Alias) ? context.Team.SingleOrDefault(t => t.Name == teamDto.Alias) : team.Alias;
            team.PrimaryColor = teamDto.PrimaryColor;
            team.SecondaryColor = teamDto.SecondaryColor;

            TeamData? data = team.TeamDatas.SingleOrDefault();
            if (data == null)
            {
                data = new TeamData() { Team = team, Tourney = tourney };
                team.TeamDatas.Add(data);
            }
            data.Penalty = teamDto.Datas?.Penalty ?? data.Penalty;
            context.SaveChanges();
            _memoryCache.Remove(uuid);
            return team;
        }

    }
}
