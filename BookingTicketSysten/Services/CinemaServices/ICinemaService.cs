using BookingTicketSysten.Models.DTOs.CinemaDTOs;

namespace BookingTicketSysten.Services.CinemaServices
{
    public interface ICinemaService
    {
        Task<List<CinemaDto>> GetAllCinemasWithHallsAsync();
        Task<CinemaDto?> GetCinemaByIdAsync(int id);
        Task<string> CreateCinemaAsync(CinemaCreateDto dto);
        Task<string> UpdateCinemaAsync(int id, CinemaUpdateDto dto);
        Task<string> DeleteCinemaAsync(int id);
        Task<List<CinemaDto>> SearchCinemaByNameAsync(string name);
    }
}
