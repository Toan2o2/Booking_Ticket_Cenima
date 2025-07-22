using BookingTicketSysten.Models.DTOs.CinemaDTOs;
using BookingTicketSysten.Services.CinemaServices;
using Microsoft.AspNetCore.Mvc;

namespace BookingTicketSysten.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    public class CinemaController : ControllerBase
    {
        private readonly ICinemaService _cinemaService;

        public CinemaController(ICinemaService cinemaService)
        {
            _cinemaService = cinemaService;
        }

        [HttpGet]
        public async Task<ActionResult<List<CinemaDto>>> GetAllCinemas()
        {
            var cinemas = await _cinemaService.GetAllCinemasWithHallsAsync();

            if (cinemas == null || cinemas.Count == 0)
            {
                return NotFound("No cinemas found.");
            }

            return Ok(cinemas);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CinemaDto>> GetCinemaById(int id)
        {
            var cinema = await _cinemaService.GetCinemaByIdAsync(id);
            if (cinema == null)
            {
                return NotFound($"Cinema with ID {id} not found.");
            }
            return Ok(cinema);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCinema([FromBody] CinemaCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors)
                                              .Select(e => e.ErrorMessage)
                                              .ToList();
                return BadRequest(new { errors });
            }

            var result = await _cinemaService.CreateCinemaAsync(dto);

            if (result == "Cinema created successfully.")
                return Ok(new { message = result });

            return BadRequest(new { error = result });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCinema(int id, [FromBody] CinemaUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(new { errors });
            }

            var result = await _cinemaService.UpdateCinemaAsync(id, dto);

            if (result == "Cinema updated successfully.")
                return Ok(new { message = result });

            return NotFound(new { error = result });
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCinema(int id)
        {
            var result = await _cinemaService.DeleteCinemaAsync(id);

            if (result == "Cinema deleted successfully.")
                return Ok(new { message = result });

            return NotFound(new { error = result });
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchCinema([FromQuery] string name)
        {
            var results = await _cinemaService.SearchCinemaByNameAsync(name);

            if (results == null || !results.Any())
                return NotFound(new { message = "No cinemas found matching the name." });

            return Ok(results);
        }
    }
}
