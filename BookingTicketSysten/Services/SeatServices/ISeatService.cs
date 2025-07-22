using BookingTicketSysten.Models.DTOs.SeatDTOs;

namespace BookingTicketSysten.Services.SeatServices
{
    public interface ISeatService
    {
        Task<List<SeatDto>> GetAllSeatsAsync();
        Task<SeatDto?> GetSeatByIdAsync(int seatId);
        Task<string> CreateSeatAsync(SeatCreateDto dto);
        Task<string> UpdateSeatAsync(int seatId, SeatUpdateDto dto);
        Task<string> DeleteSeatAsync(int seatId);
        
        // Thêm methods mới cho booking
        Task<List<SeatDto>> GetSeatsByHallAsync(int hallId);
        Task<List<int>> GetBookedSeatIdsByShowAsync(int showId);
        Task<SeatAvailabilityDto> GetSeatAvailabilityAsync(int showId);
    }
}
