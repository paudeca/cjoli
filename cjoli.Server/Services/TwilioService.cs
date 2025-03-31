using Azure.Storage.Blobs.Models;
using cjoli.Server.Models;
using System.Net.Http.Headers;
using System.Text;
using Twilio;
using Twilio.Jwt.AccessToken;
using Twilio.Rest.Api.V2010.Account;
using Twilio.TwiML.Voice;
using Stream = System.IO.Stream;
using Task = System.Threading.Tasks.Task;

namespace cjoli.Server.Services
{
    public class TwilioService
    {
        private readonly IConfiguration _configuration;
        private readonly string _accountSid;
        private readonly string _authToken;

        public TwilioService(IConfiguration configuration) {
            _configuration = configuration;
            _accountSid = _configuration["Twilio:AccountSid"]!;
            _authToken = _configuration["Twilio:AuthToken"]!;
            TwilioClient.Init(_accountSid, _authToken);
        }
        public async Task<Stream> LoadMedia(string urlMedia)
        {
            HttpClient http = new HttpClient();
            string token = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_accountSid}:{_authToken}"));
            http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", token);

           return await http.GetStreamAsync(urlMedia);
        }

        public async Task<Message> SendMessage(string body, string from, string to, Tourney tourney)
        {
            var m = await MessageResource.CreateAsync(body: body, from: from, to: to);
            Message message = new Message
            {
                MessageId = m.Sid,
                From = from,
                To = to,
                Body = body,
                MessageType = "text",
                Tourney = tourney,
                Time = DateTime.Now,
                Destination = "outbound",
            };
            return message;
        }
    }
}
