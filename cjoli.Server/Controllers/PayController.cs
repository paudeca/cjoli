using cjoli.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace cjoli.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PayController : ControllerBase
    {

        private readonly PayService _payService;
        private readonly IConfiguration _configuration;

        public PayController(PayService payService, IConfiguration configuration)
        {
            _payService = payService;
            _configuration = configuration;
        }

        [HttpGet]
        [HttpPost]
        [Route("Create")]
        public RedirectResult Create()
        {
            return Redirect(_payService.CreateSession());
        }

        [HttpPost]
        [Route("Webhook")]
        public async Task<ActionResult> Webhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var endpointSecret = _configuration["StripeWebhookSecret"];
            try
            {
                var signatureHeader = Request.Headers["Stripe-Signature"];
                var stripeEvent = EventUtility.ConstructEvent(json, signatureHeader, endpointSecret);

                if (stripeEvent.Type == EventTypes.PaymentIntentSucceeded)
                {
                    var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                    Console.WriteLine("A successful payment for {0} was made.", paymentIntent.Amount);
                    // Then define and call a method to handle the successful payment intent.
                    // handlePaymentIntentSucceeded(paymentIntent);
                }
                else if (stripeEvent.Type == EventTypes.PaymentMethodAttached)
                {
                    var paymentMethod = stripeEvent.Data.Object as PaymentMethod;
                    // Then define and call a method to handle the successful attachment of a PaymentMethod.
                    // handlePaymentMethodAttached(paymentMethod);
                }
                else
                {
                    Console.WriteLine("Unhandled event type: {0}", stripeEvent.Type);
                }
                return Ok();
            }
            catch (StripeException e)
            {
                Console.WriteLine("Error: {0}", e.Message);
                return BadRequest();
            }
            catch (Exception e)
            {
                return StatusCode(500);
            }
        }
    }
}
