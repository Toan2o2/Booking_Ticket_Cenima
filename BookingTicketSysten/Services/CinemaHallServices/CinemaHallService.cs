
using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs.CinemaHallDTOs;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingTicketSysten.Services.CinemaHallServices
{
    public class CinemaHallService : ICinemaHallService
    {
        private readonly MovieTicketBookingSystemContext _context;

        public CinemaHallService(MovieTicketBookingSystemContext context)
        {
            _context = context;
        }

        public async Task<List<CinemaHallDto>> GetAllCinemaHallsWithSeatsAsync()
        {
            return await _context.CinemaHalls
                .Include(h => h.Seats)
                .Select(h => new CinemaHallDto
                {
                    CinemaHallId = h.HallId,
                    CinemaId = h.CinemaId,
                    CinemaName = h.Cinema.Name,
                    Name = h.Name,
                    TotalSeats = h.TotalSeats,
                    CreatedAt = h.CreatedAt,
                    ModifiedAt = h.ModifiedAt,
                    Seats = h.Seats.Select(s => new SeatDto
                    {
                        SeatId = s.SeatId,
                        RowNumber = s.RowNumber,
                        ColumnNumber = s.ColumnNumber,
                        SeatType = s.SeatType
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<CinemaHallDto?> GetCinemaHallByIdAsync(int hallId)
        {
            var hall = await _context.CinemaHalls
                .Include(h => h.Seats)
                .Include(h => h.Cinema)
                .FirstOrDefaultAsync(h => h.HallId == hallId);

            if (hall == null)
                return null;

            return new CinemaHallDto
            {
                CinemaHallId = hall.HallId,
                CinemaId = hall.CinemaId,
                CinemaName = hall.Cinema.Name,
                Name = hall.Name,
                TotalSeats = hall.TotalSeats,
                CreatedAt = hall.CreatedAt,
                ModifiedAt = hall.ModifiedAt,
                Seats = hall.Seats.Select(s => new SeatDto
                {
                    SeatId = s.SeatId,
                    RowNumber = s.RowNumber,
                    ColumnNumber = s.ColumnNumber,
                    SeatType = s.SeatType
                }).ToList()
            };
        }


        public async Task<string> CreateCinemaHallAsync(CinemaHallCreateDto dto)
        {
            var cinema = await _context.Cinemas
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.CinemaId == dto.CinemaId);

            if (cinema == null)
                return "Cinema not found.";

            var isDuplicate = await _context.CinemaHalls.AnyAsync(h =>
                h.CinemaId == dto.CinemaId &&
                h.Name.ToLower() == dto.Name.Trim().ToLower());

            if (isDuplicate)
                return $"Hall '{dto.Name}' already exists in cinema '{cinema.Name}'.";

            var newHall = new CinemaHall
            {
                CinemaId = dto.CinemaId,
                Name = dto.Name.Trim(),
                TotalSeats = dto.TotalSeats,
                CreatedAt = DateTime.UtcNow
            };

            _context.CinemaHalls.Add(newHall);
            await _context.SaveChangesAsync();

            return "Cinema hall created successfully.";
        }



        public async Task<string> UpdateCinemaHallBasicInfoAsync(int hallId, CinemaHallUpdateDto dto)
        {
            var hall = await _context.CinemaHalls.FirstOrDefaultAsync(h => h.HallId == hallId);
            if (hall == null)
                return "Cinema hall not found.";

            hall.Name = dto.Name;
            hall.TotalSeats = dto.TotalSeats;
            hall.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return "Cinema hall updated successfully.";
        }

        public async Task<string> DeleteCinemaHallAsync(int hallId)
        {
            var hall = await _context.CinemaHalls
                .Include(h => h.Seats)
                .FirstOrDefaultAsync(h => h.HallId == hallId);

            if (hall == null)
                return "Cinema hall not found.";

            if (hall.Seats != null && hall.Seats.Any())
            {
                _context.Seats.RemoveRange(hall.Seats);
            }

            _context.CinemaHalls.Remove(hall);
            await _context.SaveChangesAsync();

            return "Cinema hall deleted successfully.";
        }
    }
}
