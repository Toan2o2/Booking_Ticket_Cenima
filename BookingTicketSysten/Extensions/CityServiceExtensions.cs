using BookingTicketSysten.Services.CityServices;
using Microsoft.Extensions.DependencyInjection;

namespace BookingTicketSysten.Extensions
{
    public static class CityServiceExtensions
    {
        public static IServiceCollection AddCityServices(this IServiceCollection services)
        {
            services.AddScoped<ICityService, CityService>();
            
            return services;
        }
    }
} 