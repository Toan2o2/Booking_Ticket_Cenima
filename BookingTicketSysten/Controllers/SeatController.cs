using BookingTicketSysten.Models.DTOs.SeatDTOs;
using BookingTicketSysten.Services.SeatServices;
using Microsoft.AspNetCore.Mvc;

namespace BookingTicketSysten.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class SeatController : ControllerBase
    {
        private readonly ISeatService _seatService;

        public SeatController(ISeatService seatService)
        {
            _seatService = seatService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var seats = await _seatService.GetAllSeatsAsync();
            return Ok(seats);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var seat = await _seatService.GetSeatByIdAsync(id);

            if (seat == null)
                return NotFound(new { message = "Seat not found." });

            return Ok(seat);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SeatCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors)
                                              .Select(e => e.ErrorMessage).ToList();
                return BadRequest(new { errors });
            }

            var result = await _seatService.CreateSeatAsync(dto);

            if (result == "Seat created successfully.")
                return Ok(new { message = result });

            return BadRequest(new { error = result });
        }

        [HttpPut("{seatId}")]
        public async Task<IActionResult> UpdateSeat(int seatId, [FromBody] SeatUpdateDto dto)
        {
            var result = await _seatService.UpdateSeatAsync(seatId, dto);
            if (result.Contains("not"))
                return NotFound(result);
            if (result.Contains("exists"))
                return BadRequest(result);
            return Ok(new { message = result });
        }

        [HttpDelete("{seatId}")]
        public async Task<IActionResult> Delete(int seatId)
        {
            var result = await _seatService.DeleteSeatAsync(seatId);
            if (result.Contains("not"))
                return NotFound(new { message = result });
            return Ok(new { message = result });
        }

        // Thêm endpoints mới cho booking
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
