using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs;
using BookingTicketSysten.Models.DTOs.CinemaDTOs;
using BookingTicketSysten.Models.DTOs.UserDTOs;
using BookingTicketSysten.Models.Enums;
using BookingTicketSysten.Services.BookingServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Diagnostics;
using Microsoft.EntityFrameworkCore;
using MimeKit.Tnef;

namespace BookingTicketSysten.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RevenueController : ControllerBase
    {
        private readonly MovieTicketBookingSystemContext _con;

        public RevenueController(MovieTicketBookingSystemContext con)
        {
            _con = con;
        }
        [HttpGet]
        public async Task<IActionResult> Revenue()
        {
            var obj = await _con.Bookings
                .Where(b => b.Status == "Confirmed")
                .SumAsync(b => b.TotalPrice);

            return Ok(new { TotalRevenue = obj });
        }

        [HttpGet("NumberUsers")]
        public async Task<IActionResult> NumberUsers()
        {
            var obj = await _con.Users
                 .Where(u => u.RoleId != 1 && u.RoleId != 4)
                 .CountAsync();

            return Ok(new { TotalUsers = obj });
        }

        [HttpGet("NumberMovies")]
        public async Task<IActionResult> NumberMovies()
        {
            var obj = await _con.Movies.CountAsync();

            return Ok(new { TotalMovies = obj });
        }


        [HttpGet("ScreeningToday")]
        public async Task<IActionResult> ScreeningToday()
        {
            var obj = await _con.Shows
                .Where(s => s.ShowDate.HasValue
                && s.ShowDate.Value == DateOnly.FromDateTime(DateTime.Now))
                .CountAsync();

            return Ok(new { TotalScreening = obj });
        }

        [HttpGet("NumberCinemas")]
        public async Task<IActionResult> NumberCinemas()
        {
            var obj = await _con.Cinemas.CountAsync();

            return Ok(new { TotalCinemas = obj });
        }

        [HttpGet("NumberBookings")]
        public async Task<IActionResult> NumberBookings()
        {
            var TotalBookings = await _con.Bookings
                .Where(b => b.Status == "Confirmed")
                .CountAsync();
            var TotalCancels = await _con.Bookings
                .Where(b => b.Status == "Cancelled")
                .CountAsync();

            return Ok(new { 
                TotalBookings,
                TotalCancels
            });
        }



        [HttpGet("UtilizationRate")]
        public async Task<IActionResult> UtilizationRate()
        {
            var seatUsed = await _con.BookedSeats
                .Include(bs => bs.Show)
                .Where(bs => bs.Show.ShowDate.HasValue
                && bs.Show.ShowDate.Value == DateOnly.FromDateTime(DateTime.Now))
                .CountAsync();
            var totalSeat = await _con.Seats.CountAsync();
            var result = Math.Round((double)seatUsed / totalSeat * 100, 2);
            return Ok(new { utilizationRate = result });
        }

        [HttpGet("TicketTodayInMonth")]
        public async Task<IActionResult> TicketTodayInMonth()
        {
            var today = DateTime.Today;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            var bookingsToday = await _con.Bookings
                .Where(b => b.CreatedAt.Date == today
                && b.Status == "Confirmed")
                .SumAsync(b => b.NumberOfSeats);

            var bookingsMonth = await _con.Bookings
                .Where(b => b.CreatedAt.Date >= startOfMonth
                && b.CreatedAt.Date <= today 
                && b.Status == "Confirmed")
                .SumAsync(b => b.NumberOfSeats);

            return Ok(new
            {
                bookingsToday,
                bookingsMonth
            });
        }


        [HttpGet("GetTop5Users")]
        public async Task<IActionResult> GetTop5Users()
        {
            var obj = await _con.Users
                .Where(u => u.RoleId != 1 && u.RoleId != 4)
                .OrderByDescending(u => u.ModifiedAt ?? u.CreatedAt)
                .Take(5)
                .Select(x => new UserDisplayDTOs
                {
                    Name = x.Name,
                    Email = x.Email,
                    Phone = x.Phone,
                    IsActive = x.IsActive,
                    ModifiedAt = x.ModifiedAt,
                })
                .ToListAsync();
           return Ok(obj);
        }


        [HttpGet("GetUsersByMonthsInYear")]
        public async Task<IActionResult> GetUsersByMonthsInYear(int year)
        {
            if(year == 0)
            {
                year = DateTime.Now.Year;
            }
          
            var obj = await _con.Users
                .Where(u => u.RoleId != 1 && u.RoleId != 4 && u.CreatedAt.Year == year)
                .GroupBy(u => u.CreatedAt.Month)
                .Select(g => new
                {
                    Month = g.Key,
                    UserCount = g.Count()
                })
                .OrderBy(x => x.Month)
                .ToListAsync();
            return Ok(obj);
        }

        [HttpGet("fillterUser")]
        public async Task<IActionResult> fillterUser()
        {
            var obj = await _con.Users
                .Select(s => s.CreatedAt.Year)
                .Distinct()
                .OrderByDescending(y => y)
                .ToListAsync();

            return Ok(obj);
        }



        [HttpGet("RevenueByCinema")]
        public async Task<IActionResult> RevenueByCinema()
        {
            var result = await _con.Cinemas
                .Select(cinema => new CinemaRevenueDto
                {
                    CinemaName = cinema.Name,
                    TotalRevenue = cinema.CinemaHalls
                        .SelectMany(h => h.Shows)
                        .SelectMany(s => s.Bookings)
                        .Where(b => b.Status == "Confirmed")
                        .Sum(b => (decimal?)b.TotalPrice) ?? 0,

                    TotalBookings = cinema.CinemaHalls
                        .SelectMany(h => h.Shows)
                        .SelectMany(s => s.Bookings)
                        .Count(b => b.Status == "Confirmed")
                })
                .OrderByDescending(x => x.TotalRevenue)
                .ToListAsync();

            return Ok(result);
        }


        [HttpGet("CinemaTop")]
        public async Task<IActionResult> CinemaTop()
        {
            var data = await _con.Bookings
                .Where(b => b.Status == "Confirmed")
                .Select(b => new
                {
                    CinemaName = b.Show.Hall.Cinema.Name,
                    CinemaAddress = b.Show.Hall.Cinema.Address,
                    MovieTitle = b.Show.Movie.Title,
                    b.TotalPrice
                })
                .ToListAsync();

            var result = data
                .GroupBy(x => new { x.CinemaName, x.CinemaAddress })
                .Select(g => new CinemaRevenueDto
                {
                    CinemaName = g.Key.CinemaName,
                    Address = g.Key.CinemaAddress,
                    TotalRevenue = g.Sum(x => x.TotalPrice),
                    TotalBookings = g.Count()
                })
                .OrderByDescending(x => x.TotalRevenue)
                .FirstOrDefault();

            return Ok(result);
        }



        [HttpGet("RevenueByCinemaFromStartToEnd/{start?}/{end?}")]
        public async Task<IActionResult> RevenueByCinemaFromStartToEnd(DateOnly? start, DateOnly? end)
        {
            var result = await _con.Cinemas
                .Select(cinema => new CinemaRevenueDto
                {
                    CinemaName = cinema.Name,

                    TotalRevenue = cinema.CinemaHalls
                        .SelectMany(h => h.Shows)
                        .SelectMany(s => s.Bookings)
                        .Where(b => b.Status == "Confirmed"
                                    && (!start.HasValue || DateOnly.FromDateTime(b.CreatedAt) >= start.Value)
                                    && (!end.HasValue || DateOnly.FromDateTime(b.CreatedAt) <= end.Value))
                        .Sum(b => (decimal?)b.TotalPrice) ?? 0,

                    TotalBookings = cinema.CinemaHalls
                        .SelectMany(h => h.Shows)
                        .SelectMany(s => s.Bookings)
                        .Count(b => b.Status == "Confirmed"
                                    && (!start.HasValue || DateOnly.FromDateTime(b.CreatedAt) >= start.Value)
                                    && (!end.HasValue || DateOnly.FromDateTime(b.CreatedAt) <= end.Value))
                })
                .OrderByDescending(x => x.TotalRevenue)
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("MovieTop")]
        public async Task<IActionResult> MovieTop()
        {
            var topMovie = await _con.Bookings
                .Where(b => b.Status == "Confirmed")
                .GroupBy(b => new { b.Show.MovieId, b.Show.Movie.Title })
                .Select(g => new MovieRevenueDto
                {
                    MovieTitle = g.Key.Title,
                    TotalRevenue = g.Sum(b => b.TotalPrice),
                })
                .OrderByDescending(x => x.TotalRevenue)
                .FirstOrDefaultAsync();

            return Ok(topMovie);
        }

        [HttpGet("RevenueByMovies")]
        public async Task<IActionResult> RevenueByMovies()
        {
            var result = await _con.Movies
                .Select(movie => new MovieRevenueDto
                {
                    MovieTitle = movie.Title,
                    TotalRevenue = movie.Shows
                        .SelectMany(show => show.Bookings)
                        .Where(b => b.Status == "Confirmed")
                        .Sum(b => (decimal?)b.TotalPrice) ?? 0
                })
                .OrderByDescending(x => x.TotalRevenue)
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("RevenueFirstWeek_Month_YearByMovie/{periodType}")]
        public async Task<IActionResult> RevenueFirstWeek_Month_YearByMovie(PeriodType periodType)
        {
            var firstDates = await _con.Shows
                .Where(s => s.ShowDate.HasValue)
                .GroupBy(s => s.MovieId)
                .Select(g => new
                {
                    MovieId = g.Key,
                    FirstShowDate = g.Min(s => s.ShowDate.Value)
                })
                .ToListAsync();

            var movies = await _con.Movies.ToListAsync();

            var confirmedBookings = await _con.Bookings
                .Include(b => b.Show)
                    .ThenInclude(s => s.Movie)
                .Where(b => b.Status == "Confirmed")
                .ToListAsync();

            var result = movies.Select(movie =>
            {
                var firstShow = firstDates.FirstOrDefault(x => x.MovieId == movie.MovieId);
                if (firstShow == null)
                {
                    return new MovieRevenueDto
                    {
                        MovieTitle = movie.Title,
                        TotalRevenue = 0
                    };
                }

                var startDate = firstShow.FirstShowDate;
                var endDate = periodType switch
                {
                    PeriodType.Week => startDate.AddDays(6),
                    PeriodType.Month => startDate.AddMonths(1).AddDays(-1),
                    PeriodType.Quarter => startDate.AddMonths(3).AddDays(-1),
                    PeriodType.Year => startDate.AddYears(1).AddDays(-1),
                    _ => startDate.AddDays(6)
                };

                var bookingsInRange = confirmedBookings
                    .Where(b =>
                        b.Show.MovieId == movie.MovieId &&
                        DateOnly.FromDateTime(b.CreatedAt) >= startDate &&
                        DateOnly.FromDateTime(b.CreatedAt) <= endDate)
                    .ToList();

                return new MovieRevenueDto
                {
                    MovieTitle = movie.Title,
                    TotalRevenue = bookingsInRange.Sum(b => b.TotalPrice)
                };
            })
            .OrderByDescending(x => x.TotalRevenue)
            .ToList();

            return Ok(result);
        }

        [HttpGet("RevenueByMoviesFromStartToEnd/{start?}/{end?}")]
        public async Task<IActionResult> RevenueByMoviesFromStartToEnd(DateOnly? start, DateOnly? end)
        {

            var result = await _con.Movies
                .Select(movie => new MovieRevenueDto
                {
                    MovieTitle = movie.Title,
                    TotalRevenue = movie.Shows
                        .SelectMany(show => show.Bookings)
                        .Where(b => b.Status == "Confirmed"
                                    && (!start.HasValue || DateOnly.FromDateTime(b.CreatedAt) >= start.Value)
                                    && (!end.HasValue || DateOnly.FromDateTime(b.CreatedAt) <= end.Value))
                        .Sum(b => (decimal?)b.TotalPrice) ?? 0
                })
                .OrderByDescending(x => x.TotalRevenue)
                .ToListAsync();

            return Ok(result);
        }
    }
}
