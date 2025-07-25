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
            try
            {
                var created = await _showService.CreateShowAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.ShowId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi tạo suất chiếu: {ex.Message}" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateShowDto dto)
        {
            try
            {
                var updated = await _showService.UpdateShowAsync(id, dto);
                return updated ? NoContent() : NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi cập nhật suất chiếu: {ex.Message}" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _showService.DeleteShowAsync(id);
                return deleted ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi xóa suất chiếu: {ex.Message}" });
            }
        }
    }
}