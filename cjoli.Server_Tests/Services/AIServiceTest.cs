using Azure;
using Azure.AI.OpenAI;
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

        public AIServiceTest(AIService service, CJoliContext context, Mock<Response<ChatCompletions>> response) : base(context)
        {
            _service = service;
            _transaction = _context.Database.BeginTransaction();
            _response = response;
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

            var session = _service.CreateSession(tourney.Uid, "fr", _context);

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
