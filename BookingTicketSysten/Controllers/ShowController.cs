using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs.ShowDTOS;
using BookingTicketSysten.Services.ShowServices;
using Microsoft.AspNetCore.Mvc;

namespace BookingTicketSysten.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShowController : Controller
    {
        private readonly IShowService _showService;

        public ShowController(IShowService showService)
        {
            _showService = showService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _showService.GetAllShowsAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var show = await _showService.GetShowByIdAsync(id);
            return show == null ? NotFound() : Ok(show);
        }

        [HttpGet("by-movie/{movieId}")]
        public async Task<IActionResult> GetByMovieId(int movieId)
        {
            var shows = await _showService.GetShowsByMovieIdAsync(movieId);
            return Ok(shows);
        }

        [HttpGet("by-date/{date}")]
        public async Task<IActionResult> GetByDate(DateOnly date)
        {
            var shows = await _showService.GetShowsByDateAsync(date);
            return Ok(shows);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateShowDto dto)
        {
            var created = await _showService.CreateShowAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.ShowId }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateShowDto dto)
        {
            var updated = await _showService.UpdateShowAsync(id, dto);
            return updated ? NoContent() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _showService.DeleteShowAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}