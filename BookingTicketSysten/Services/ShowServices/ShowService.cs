using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs.ShowDTOS;
using Microsoft.EntityFrameworkCore;

namespace BookingTicketSysten.Services.ShowServices
{
    public class ShowService : IShowService
    {
        private readonly MovieTicketBookingSystemContext _context;

        public ShowService(MovieTicketBookingSystemContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ShowDto>> GetAllShowsAsync()
        {
            return await _context.Shows
                .Include(s => s.Movie)
                .Include(s => s.Hall)
                .Include(s => s.Hall).ThenInclude(h => h.Cinema)
                .Select(s => new ShowDto
                {
                    ShowId = s.ShowId,
                    MovieId = s.MovieId,
                    MovieTitle = s.Movie.Title,
                    HallId = s.HallId,
                    HallName = s.Hall.Name,
                    CinemaName = s.Hall.Cinema.Name,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    TicketPrice = s.TicketPrice,
                    ShowDate = s.ShowDate
                }).ToListAsync();
        }

        public async Task<ShowDto?> GetShowByIdAsync(int id)
        {
            var s = await _context.Shows
                .Include(s => s.Movie)
                .Include(s => s.Hall)
                .Include(s => s.Hall).ThenInclude(h => h.Cinema)
                .FirstOrDefaultAsync(s => s.ShowId == id);

            if (s == null) return null;

            return new ShowDto
            {
                ShowId = s.ShowId,
                MovieId = s.MovieId,
                MovieTitle = s.Movie.Title,
                HallId = s.HallId,
                HallName = s.Hall.Name,
                CinemaName = s.Hall.Cinema.Name,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                TicketPrice = s.TicketPrice,
                ShowDate = s.ShowDate
            };
        }

        public async Task<ShowDto> CreateShowAsync(CreateShowDto dto)
        {
            // Get current date and time for validation
            var today = DateOnly.FromDateTime(DateTime.Today);
            var now = DateTime.Now;

            if (dto.ShowDate.HasValue && dto.ShowDate.Value < today)
            {
                throw new InvalidOperationException("Không thể tạo suất chiếu trong quá khứ");
            }

            DateOnly? showDate;
            if (!dto.ShowDate.HasValue && dto.StartTime != DateTime.MinValue)
            {
                showDate = DateOnly.FromDateTime(dto.StartTime.Date);
                if (showDate.Value < today)
                {
                    throw new InvalidOperationException("Không thể tạo suất chiếu trong quá khứ");
                }
            }
            else if (dto.ShowDate.HasValue)
            {
                showDate = dto.ShowDate.Value;
            }
            else
            {
                showDate = DateOnly.FromDateTime(DateTime.Today);
            }
            
            // Check if the start time is in the past
            // If the show is for today, validate that the time hasn't passed
            if (showDate.Value == today && dto.StartTime < now)
            {
                throw new InvalidOperationException("Không thể tạo suất chiếu trong quá khứ");
            }

            var show = new Show
            {
                MovieId = dto.MovieId,
                HallId = dto.HallId,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                TicketPrice = dto.TicketPrice,
                ShowDate = showDate,
                CreatedAt = DateTime.Now
            };

            _context.Shows.Add(show);
            await _context.SaveChangesAsync();

            return await GetShowByIdAsync(show.ShowId);
        }

        public async Task<bool> UpdateShowAsync(int id, CreateShowDto dto)
        {
            var show = await _context.Shows.FindAsync(id);
            if (show == null) return false;

            // Get current date and time for validation
            var today = DateOnly.FromDateTime(DateTime.Today);
            var now = DateTime.Now;

            if (dto.ShowDate.HasValue && dto.ShowDate.Value < today)
            {
                throw new InvalidOperationException("Không thể cập nhật suất chiếu vào ngày trong quá khứ");
            }

            DateOnly? showDate;
            if (!dto.ShowDate.HasValue && dto.StartTime != DateTime.MinValue)
            {
                showDate = DateOnly.FromDateTime(dto.StartTime.Date);
                if (showDate.Value < today)
                {
                    throw new InvalidOperationException("Không thể tạo suất chiếu trong quá khứ");
                }
            }
            else if (dto.ShowDate.HasValue)
            {
                showDate = dto.ShowDate.Value;
            }
            else
            {
                showDate = show.ShowDate ?? DateOnly.FromDateTime(DateTime.Today);
            }
            
            // Check if the start time is in the past
            // If the show is for today, validate that the time hasn't passed
            if (showDate.Value == today && dto.StartTime < now)
            {
                throw new InvalidOperationException("Không thể cập nhật suất chiếu với thời gian trong quá khứ");
            }

            show.MovieId = dto.MovieId;
            show.HallId = dto.HallId;
            show.StartTime = dto.StartTime;
            show.EndTime = dto.EndTime;
            show.TicketPrice = dto.TicketPrice;
            show.ShowDate = showDate;
            show.ModifiedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteShowAsync(int id)
        {
            var show = await _context.Shows.FindAsync(id);
            if (show == null) return false;

            _context.Shows.Remove(show);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<ShowDto>> GetShowsByMovieIdAsync(int movieId)
        {
            return await _context.Shows
                .Include(s => s.Movie)
                .Include(s => s.Hall)
                .Include(s => s.Hall).ThenInclude(h => h.Cinema)
                .Where(s => s.MovieId == movieId)
                .Select(s => new ShowDto
                {
                    ShowId = s.ShowId,
                    MovieId = s.MovieId,
                    MovieTitle = s.Movie.Title,
                    HallId = s.HallId,
                    HallName = s.Hall.Name,
                    CinemaName = s.Hall.Cinema.Name,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    TicketPrice = s.TicketPrice,
                    ShowDate = s.ShowDate
                }).ToListAsync();
        }

        public async Task<IEnumerable<ShowDto>> GetShowsByDateAsync(DateOnly date)
        {
            return await _context.Shows
                .Include(s => s.Movie)
                .Include(s => s.Hall)
                .Include(s => s.Hall).ThenInclude(h => h.Cinema)
                .Where(s => s.ShowDate == date)
                .Select(s => new ShowDto
                {
                    ShowId = s.ShowId,
                    MovieId = s.MovieId,
                    MovieTitle = s.Movie.Title,
                    HallId = s.HallId,
                    HallName = s.Hall.Name,
                    CinemaName = s.Hall.Cinema.Name,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    TicketPrice = s.TicketPrice,
                    ShowDate = s.ShowDate
                }).ToListAsync();
        }
    }
}