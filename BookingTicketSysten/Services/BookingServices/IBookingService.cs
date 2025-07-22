using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs.BookingDTOs;

namespace BookingTicketSysten.Services.BookingServices
{
    public interface IBookingService
    {
        Task<IEnumerable<BookingDto>> GetAllBookingsAsync();
        Task<BookingDto?> GetBookingByIdAsync(int id);
        Task<BookingDto?> CreateBookingAsync(CreateBookingDto dto);
        Task<bool> CancelBookingAsync(int id);
        Task<IEnumerable<BookingDto>> GetBookingsByUserIdAsync(int userId);
        Task<IEnumerable<BookingDto>> GetBookingsByShowDateAsync(DateOnly date);
        Task<RevenueStatisticsDto> GetRevenueStatisticsAsync(DateTime? fromDate, DateTime? toDate);
    }
}
