using BookingTicketSysten.Models.DTOs.BookingDTOs;
using BookingTicketSysten.Services.BookingServices;
using Microsoft.AspNetCore.Mvc;

namespace BookingTicketSysten.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : Controller
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _bookingService.GetAllBookingsAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var booking = await _bookingService.GetBookingByIdAsync(id);
            return booking == null ? NotFound() : Ok(booking);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            var bookings = await _bookingService.GetBookingsByUserIdAsync(userId);
            return Ok(bookings);
        }

        [HttpGet("by-show-date/{date}")]
        public async Task<IActionResult> GetByShowDate(DateOnly date)
        {
            var bookings = await _bookingService.GetBookingsByShowDateAsync(date);
            return Ok(bookings);
        }

        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueStatistics([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            var stats = await _bookingService.GetRevenueStatisticsAsync(fromDate, toDate);
            return Ok(stats);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBookingDto dto)
        {
            var created = await _bookingService.CreateBookingAsync(dto);
            return created == null ? BadRequest("Seat unavailable or invalid data.") : Ok(created);
        }

        [HttpPut("cancel/{id}")]
        public async Task<IActionResult> Cancel(int id)
        {
            var result = await _bookingService.CancelBookingAsync(id);
            return result ? Ok("Cancelled.") : NotFound();
        }
    }
}