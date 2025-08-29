using AutoMapper;
using Azure;
using Azure.AI.OpenAI;
using cjoli.Server.Dtos;
using cjoli.Server.Models;
using cjoli.Server.Services;
using Microsoft.EntityFrameworkCore.Storage;
using Moq;

namespace cjoli.Server_Tests.Services
{
    [Collection("CJoli")]
    public class AIServiceTest : AbstractTest, IDisposable
    {
        private readonly AIService _service;
        private readonly IDbContextTransaction _transaction;
        private readonly Mock<Response<ChatCompletions>> _response;
        private readonly IMapper _mapper;

        public AIServiceTest(AIService service, CJoliContext context, Mock<Response<ChatCompletions>> response, IMapper mapper) : base(context)
        {
            _service = service;
            _transaction = _context.Database.BeginTransaction();
            _response = response;
            _mapper = mapper;
        }

        public void Dispose()
        {
            _transaction.Rollback();
        }

        private void SetResponse(string message)
        {
            var choices = new List<ChatChoice>
            {
                AzureOpenAIModelFactory.ChatChoice(
                    message: AzureOpenAIModelFactory.ChatResponseMessage(role:ChatRole.Assistant,content:message),
                    index: 0,
                    finishReason: CompletionsFinishReason.Stopped
                ),
            };
            var chatCompletions = AzureOpenAIModelFactory.ChatCompletions(null, default, choices, null, null);
            _response.Setup(x => x.Value).Returns(chatCompletions);
        }

        [Fact]
        public async Task PromptMessage()
        {
            //Arrange
            var tourney = CreateTourney();
            var match = Match(tourney);
            match.Done = true;
            _context.SaveChanges();
            SetResponse("myMessage");

            var tourneyDto = _mapper.Map<TourneyDto>(tourney);
            var scoresDto = new ScoresDto() { ScoreTeams = new Dictionary<int, Score>(), Bet = new BetDto(), ScoreTourney = new Score() };
            RankingDto dto = new RankingDto() { Scores = scoresDto, Tourney = tourneyDto };
            var session = _service.CreateSessionForChat(tourney.Uid, "fr", null, dto, _context);

            var called = false;
            session.OnReply += (sender, m) =>
            {
                Assert.Equal("myMessage", m.Message);
                called = true;
            };
            //Act
            await _service.PromptMessage(session);
            //Assert
            Assert.True(called);
        }
    }
}
