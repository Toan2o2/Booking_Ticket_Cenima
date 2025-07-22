
using BookingTicketSysten.Models.DTOs.CinemaHallDTOs;
using BookingTicketSysten.Services.CinemaHallServices;
using Microsoft.AspNetCore.Mvc;

namespace BookingTicketSysten.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    public class CinemaHallController : ControllerBase
    {
        private readonly ICinemaHallService _cinemaHallService;

        public CinemaHallController(ICinemaHallService cinemaHallService)
        {
            _cinemaHallService = cinemaHallService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllWithSeats()
        {
            var result = await _cinemaHallService.GetAllCinemaHallsWithSeatsAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _cinemaHallService.GetCinemaHallByIdAsync(id);

            if (result == null)
                return NotFound(new { message = "Cinema hall not found." });

            return Ok(result);
        }


        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CinemaHallCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors)
                                              .Select(e => e.ErrorMessage).ToList();
                return BadRequest(new { errors });
            }

            var result = await _cinemaHallService.CreateCinemaHallAsync(dto);

            if (result == "Cinema hall created successfully.")
                return Ok(new { message = result });

            return BadRequest(new { error = result });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CinemaHallUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors)
                                              .Select(e => e.ErrorMessage).ToList();
                return BadRequest(new { errors });
            }

            var result = await _cinemaHallService.UpdateCinemaHallBasicInfoAsync(id, dto);

            if (result == "Cinema hall updated successfully.")
                return Ok(new { message = result });

            return NotFound(new { error = result });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _cinemaHallService.DeleteCinemaHallAsync(id);

            if (result.Contains("not found"))
                return NotFound(new { error = result });

            return Ok(new { message = result });
        }
    }
}
