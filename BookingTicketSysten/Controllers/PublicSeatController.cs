using BookingTicketSysten.Models.DTOs.SeatDTOs;
using BookingTicketSysten.Services.SeatServices;
using Microsoft.AspNetCore.Mvc;

namespace BookingTicketSysten.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PublicSeatController : ControllerBase
    {
        private readonly ISeatService _seatService;

        public PublicSeatController(ISeatService seatService)
        {
            _seatService = seatService;
        }

        [HttpGet("by-hall/{hallId}")]
        public async Task<IActionResult> GetByHall(int hallId)
        {
            try
            {
                var seats = await _seatService.GetSeatsByHallAsync(hallId);
                return Ok(seats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("booked-by-show/{showId}")]
        public async Task<IActionResult> GetBookedSeatsByShow(int showId)
        {
            try
            {
                var bookedSeatIds = await _seatService.GetBookedSeatIdsByShowAsync(showId);
                return Ok(bookedSeatIds);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("availability/{showId}")]
        public async Task<IActionResult> GetSeatAvailability(int showId)
        {
            try
            {
                var availability = await _seatService.GetSeatAvailabilityAsync(showId);
                return Ok(availability);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
} 