using BookingTicketSysten.Models.DTOs.CityDTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingTicketSysten.Services.CityServices
{
    public interface ICityService
    {
        Task<IEnumerable<CityDto>> GetAllCitiesAsync();
        Task<CityDto> GetCityByIdAsync(int cityId);
        Task<CityDto> GetCityByNameAsync(string cityName);
        Task<CityDto> CreateCityAsync(CityCreateUpdateDto cityDto);
        Task<CityDto> UpdateCityAsync(int cityId, CityCreateUpdateDto cityDto);
        Task<bool> DeleteCityAsync(int cityId);
        Task<IEnumerable<CityDto>> SearchCitiesAsync(string searchTerm);
        Task<bool> CityExistsAsync(int cityId);
        Task<bool> CityNameExistsAsync(string cityName);
    }
} 