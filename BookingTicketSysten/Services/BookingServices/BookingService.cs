using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs.BookingDTOs;
using Microsoft.EntityFrameworkCore;

namespace BookingTicketSysten.Services.BookingServices
{
    public class BookingService : IBookingService
    {
        private readonly MovieTicketBookingSystemContext _context;

        public BookingService(MovieTicketBookingSystemContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BookingDto>> GetAllBookingsAsync()
        {
            return await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Show).ThenInclude(s => s.Movie)
                .Include(b => b.Show).ThenInclude(s => s.Hall).ThenInclude(h => h.Cinema)
                .Include(b => b.BookedSeats).ThenInclude(bs => bs.Seat)
                .Select(b => new BookingDto
                {
                    BookingId = b.BookingId,
                    UserName = b.User.Name,
                    MovieTitle = b.Show.Movie.Title,
                    ShowStartTime = b.Show.StartTime,
                    ShowDate = b.Show.ShowDate,
                    NumberOfSeats = b.NumberOfSeats,
                    TotalPrice = b.TotalPrice,
                    Status = b.Status,
                    Seats = b.BookedSeats.Select(bs => new SeatInfoDto
                    {
                        SeatId = bs.Seat.SeatId,
                        RowNumber = bs.Seat.RowNumber,
                        ColumnNumber = bs.Seat.ColumnNumber,
                        SeatType = bs.Seat.SeatType
                    }).ToList(),
                    HallName = b.Show.Hall.Name,
                    CinemaName = b.Show.Hall.Cinema.Name,
                    CinemaAddress = b.Show.Hall.Cinema.Address
                }).ToListAsync();
        }

        public async Task<BookingDto?> GetBookingByIdAsync(int id)
        {
            var b = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Show).ThenInclude(s => s.Movie)
                .Include(b => b.Show).ThenInclude(s => s.Hall).ThenInclude(h => h.Cinema)
                .Include(b => b.BookedSeats).ThenInclude(bs => bs.Seat)
                .FirstOrDefaultAsync(b => b.BookingId == id);

            if (b == null) return null;

            return new BookingDto
            {
                BookingId = b.BookingId,
                UserName = b.User.Name,
                MovieTitle = b.Show.Movie.Title,
                ShowStartTime = b.Show.StartTime,
                ShowDate = b.Show.ShowDate,
                NumberOfSeats = b.NumberOfSeats,
                TotalPrice = b.TotalPrice,
                Status = b.Status,
                Seats = b.BookedSeats.Select(bs => new SeatInfoDto
                {
                    SeatId = bs.Seat.SeatId,
                    RowNumber = bs.Seat.RowNumber,
                    ColumnNumber = bs.Seat.ColumnNumber,
                    SeatType = bs.Seat.SeatType
                }).ToList(),
                HallName = b.Show.Hall.Name,
                CinemaName = b.Show.Hall.Cinema.Name,
                CinemaAddress = b.Show.Hall.Cinema.Address
            };
        }

        public async Task<BookingDto?> CreateBookingAsync(CreateBookingDto dto)
        {
            var show = await _context.Shows.FindAsync(dto.ShowId);
            if (show == null || dto.SeatIds.Count == 0) return null;

            var booked = await _context.BookedSeats
                .Where(bs => dto.SeatIds.Contains(bs.SeatId) && bs.ShowId == dto.ShowId)
                .ToListAsync();
            if (booked.Any()) return null;

            var booking = new Booking
            {
                UserId = dto.UserId,
                ShowId = dto.ShowId,
                QrcodeData = dto.QrCodeData,
                CreatedAt = DateTime.Now,
                Status = "Confirmed",
                NumberOfSeats = dto.SeatIds.Count,
                TotalPrice = dto.SeatIds.Count * show.TicketPrice
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            foreach (var seatId in dto.SeatIds)
            {
                _context.BookedSeats.Add(new BookedSeat
                {
                    BookingId = booking.BookingId,
                    SeatId = seatId,
                    ShowId = dto.ShowId
                });
            }

            await _context.SaveChangesAsync();
            return await GetBookingByIdAsync(booking.BookingId);
        }

        public async Task<bool> CancelBookingAsync(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookedSeats)
                .FirstOrDefaultAsync(b => b.BookingId == id);
            if (booking == null) return false;

            booking.Status = "Cancelled";
            booking.ModifiedAt = DateTime.Now;

            _context.BookedSeats.RemoveRange(booking.BookedSeats);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<BookingDto>> GetBookingsByUserIdAsync(int userId)
        {
            return await _context.Bookings
                .Where(b => b.UserId == userId)
                .Include(b => b.User)
                .Include(b => b.Show).ThenInclude(s => s.Movie)
                .Include(b => b.Show).ThenInclude(s => s.Hall).ThenInclude(h => h.Cinema)
                .Include(b => b.BookedSeats).ThenInclude(bs => bs.Seat)
                .Select(b => new BookingDto
                {
                    BookingId = b.BookingId,
                    UserName = b.User.Name,
                    MovieTitle = b.Show.Movie.Title,
                    ShowStartTime = b.Show.StartTime,
                    ShowDate = b.Show.ShowDate,
                    NumberOfSeats = b.NumberOfSeats,
                    TotalPrice = b.TotalPrice,
                    Status = b.Status,
                    Seats = b.BookedSeats.Select(bs => new SeatInfoDto
                    {
                        SeatId = bs.Seat.SeatId,
                        RowNumber = bs.Seat.RowNumber,
                        ColumnNumber = bs.Seat.ColumnNumber,
                        SeatType = bs.Seat.SeatType
                    }).ToList(),
                    HallName = b.Show.Hall.Name,
                    CinemaName = b.Show.Hall.Cinema.Name,
                    CinemaAddress = b.Show.Hall.Cinema.Address
                }).ToListAsync();
        }

        public async Task<IEnumerable<BookingDto>> GetBookingsByShowDateAsync(DateOnly date)
        {
            return await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Show).ThenInclude(s => s.Movie)
                .Include(b => b.Show).ThenInclude(s => s.Hall).ThenInclude(h => h.Cinema)
                .Include(b => b.BookedSeats).ThenInclude(bs => bs.Seat)
                .Where(b => b.Show.ShowDate == date)
                .Select(b => new BookingDto
                {
                    BookingId = b.BookingId,
                    UserName = b.User.Name,
                    MovieTitle = b.Show.Movie.Title,
                    ShowStartTime = b.Show.StartTime,
                    ShowDate = b.Show.ShowDate,
                    NumberOfSeats = b.NumberOfSeats,
                    TotalPrice = b.TotalPrice,
                    Status = b.Status,
                    Seats = b.BookedSeats.Select(bs => new SeatInfoDto
                    {
                        SeatId = bs.Seat.SeatId,
                        RowNumber = bs.Seat.RowNumber,
                        ColumnNumber = bs.Seat.ColumnNumber,
                        SeatType = bs.Seat.SeatType
                    }).ToList(),
                    HallName = b.Show.Hall.Name,
                    CinemaName = b.Show.Hall.Cinema.Name,
                    CinemaAddress = b.Show.Hall.Cinema.Address
                }).ToListAsync();
        }

        public async Task<RevenueStatisticsDto> GetRevenueStatisticsAsync(DateTime? fromDate, DateTime? toDate)
        {
            var query = _context.Bookings.AsQueryable();

            if (fromDate.HasValue)
                query = query.Where(b => b.CreatedAt >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(b => b.CreatedAt <= toDate.Value);

            var totalRevenue = await query.SumAsync(b => b.TotalPrice);
            var totalBookings = await query.CountAsync();
            var averageRevenue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

            return new RevenueStatisticsDto
            {
                TotalRevenue = totalRevenue,
                TotalBookings = totalBookings,
                AverageRevenue = averageRevenue,
                FromDate = fromDate,
                ToDate = toDate
            };
        }
    }
}