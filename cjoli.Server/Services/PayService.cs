using Stripe.Checkout;

namespace cjoli.Server.Services
{
    public class PayService
    {
        public string CreateSession()
        {
            var domain = "http://localhost:5173/cholet2026/game";
            var options = new SessionCreateOptions
            {
                LineItems = new List<SessionLineItemOptions>
                {
                  new SessionLineItemOptions
                  {
                    Price = "price_1SiYI90Y7VGdJygIjI3TyaUj",
                    Quantity = 1,
                  },
                },
                Mode = "payment",
                SuccessUrl = domain + "?success=true",
                AutomaticTax = new SessionAutomaticTaxOptions { Enabled = false },
            };
            var service = new SessionService();
            Session session = service.Create(options);

            return session.Url;
        }
    }
}
