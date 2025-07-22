using BookingTicketSysten.Models.DTOs.CinemaHallDTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingTicketSysten.Services.CinemaHallServices
{
    public interface ICinemaHallService
    {
        Task<List<CinemaHallDto>> GetAllCinemaHallsWithSeatsAsync();
        Task<CinemaHallDto?> GetCinemaHallByIdAsync(int hallId);
        Task<string> CreateCinemaHallAsync(CinemaHallCreateDto dto);
        Task<string> UpdateCinemaHallBasicInfoAsync(int hallId, CinemaHallUpdateDto dto);
        Task<string> DeleteCinemaHallAsync(int hallId);
    }
}
