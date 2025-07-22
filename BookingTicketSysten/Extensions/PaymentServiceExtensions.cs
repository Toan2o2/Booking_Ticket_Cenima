using BookingTicketSysten.Services.PaymentServices;
using Microsoft.Extensions.DependencyInjection;

namespace BookingTicketSysten.Extensions
{
    public static class PaymentServiceExtensions
    {
        public static IServiceCollection AddPaymentServices(this IServiceCollection services)
        {
            services.AddScoped<IPaymentService, PaymentService>();
            
            return services;
        }
    }
} 