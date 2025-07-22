using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs.CinemaDTOs;
using Microsoft.EntityFrameworkCore;

namespace BookingTicketSysten.Services.CinemaServices
{
    public class CinemaService : ICinemaService
    {
        private readonly MovieTicketBookingSystemContext _context;

        public CinemaService(MovieTicketBookingSystemContext context)
        {
            _context = context;
        }

        public async Task<List<CinemaDto>> GetAllCinemasWithHallsAsync()
        {
            var cinemas = await _context.Cinemas
                .Include(c => c.CinemaHalls)
                .Select(c => new CinemaDto
                {
                    CinemaId = c.CinemaId,
                    Name = c.Name,
                    Address = c.Address,
                    CityId = c.CityId,
                    CityName = c.City.Name,
                    ContactInfo = c.ContactInfo,
                    CreatedAt = c.CreatedAt,
                    ModifiedAt = c.ModifiedAt,
                    CinemaHallCount = c.CinemaHalls.Count,
                    CinemaHall = c.CinemaHalls.Select(h => new CinemaHallDto
                    {
                        HallId = h.HallId,
                        Name = h.Name,
                        TotalSeats = h.TotalSeats,
                        CreatedAt = h.CreatedAt,
                        ModifiedAt = h.ModifiedAt
                    }).ToList()
                })
                .ToListAsync();

            return cinemas;
        }

        public async Task<CinemaDto?> GetCinemaByIdAsync(int id)
        {
            var cinema = await _context.Cinemas
                .Include(c => c.CinemaHalls)
                .Include(c => c.City)
                .Where(c => c.CinemaId == id)
                .Select(c => new CinemaDto
                {
                    CinemaId = c.CinemaId,
                    Name = c.Name,
                    Address = c.Address,
                    CityId = c.CityId,
                    CityName = c.City.Name, 
                    ContactInfo = c.ContactInfo,
                    CreatedAt = c.CreatedAt,
                    ModifiedAt = c.ModifiedAt,
                    CinemaHallCount = c.CinemaHalls.Count,
                    CinemaHall = c.CinemaHalls.Select(h => new CinemaHallDto
                    {
                        HallId = h.HallId,
                        Name = h.Name,
                        TotalSeats = h.TotalSeats,
                        CreatedAt = h.CreatedAt,
                        ModifiedAt = h.ModifiedAt
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            return cinema;
        }

        public async Task<string> CreateCinemaAsync(CinemaCreateDto dto)
        {
            var cityExists = await _context.Cities
                .AsNoTracking()
                .AnyAsync(c => c.CityId == dto.CityId);

            if (!cityExists)
            {
                return "City does not exist.";
            }

            var cinema = new Cinema
            {
                Name = dto.Name.Trim(),
                Address = dto.Address.Trim(),
                CityId = dto.CityId,
                ContactInfo = dto.ContactInfo.Trim(),
                CreatedAt = DateTime.UtcNow,
            };

            _context.Cinemas.Add(cinema);
            await _context.SaveChangesAsync();

            return "Cinema created successfully.";
        }


        public async Task<string> UpdateCinemaAsync(int id, CinemaUpdateDto dto)
        {
            var cinema = await _context.Cinemas.FindAsync(id);

            if (cinema == null)
                return "Cinema not found.";

            cinema.Name = dto.Name.Trim();
            cinema.Address = dto.Address.Trim();
            cinema.ContactInfo = dto.ContactInfo.Trim();
            cinema.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return "Cinema updated successfully.";
        }


        public async Task<string> DeleteCinemaAsync(int id)
        {
            var cinema = await _context.Cinemas
                .Include(c => c.CinemaHalls)
                    .ThenInclude(h => h.Seats)
                .FirstOrDefaultAsync(c => c.CinemaId == id);

            if (cinema == null)
                return "Cinema not found.";

            foreach (var hall in cinema.CinemaHalls)
            {
                _context.Seats.RemoveRange(hall.Seats);
            }

            _context.CinemaHalls.RemoveRange(cinema.CinemaHalls);

            _context.Cinemas.Remove(cinema);

            await _context.SaveChangesAsync();

            return "Cinema deleted successfully.";
        }

        public async Task<List<CinemaDto>> SearchCinemaByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return new List<CinemaDto>();

            return await _context.Cinemas
                .Include(c => c.City)
                .Include(c => c.CinemaHalls)
                .Where(c => c.Name.ToLower().Contains(name.Trim().ToLower()))
                .Select(c => new CinemaDto
                {
                    Name = c.Name,
                    Address = c.Address,
                    CityName = c.City.Name,
                    ContactInfo = c.ContactInfo,
                    CreatedAt = c.CreatedAt,
                    ModifiedAt = c.ModifiedAt,
                    CinemaHallCount = c.CinemaHalls.Count,
                    CinemaHall = c.CinemaHalls.Select(h => new CinemaHallDto
                    {
                        HallId = h.HallId,
                        Name = h.Name,
                        TotalSeats = h.TotalSeats,
                        CreatedAt = h.CreatedAt,
                        ModifiedAt = h.ModifiedAt
                    }).ToList()
                })
                .ToListAsync();
        }




    }
}
