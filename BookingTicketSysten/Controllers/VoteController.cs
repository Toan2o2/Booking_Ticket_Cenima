using BookingTicketSysten.Models.DTOs.VoteDTOs;
using BookingTicketSysten.Services.VoteServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace BookingTicketSysten.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VoteController : ControllerBase
    {
        private readonly IVoteService _voteService;
        public VoteController(IVoteService voteService)
        {
            _voteService = voteService;
        }
        // 1.1. Gửi đánh giá cho phim (tạo hoặc cập nhật)
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateOrUpdate([FromBody] VoteCreateUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid) 
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    return BadRequest(new { message = "Validation failed", errors });
                }

                // Log the incoming data
                Console.WriteLine($"Creating/updating vote: MovieId={dto.MovieId}, UserId={dto.UserId}, Rating={dto.RatingValue}");

                var result = await _voteService.CreateOrUpdateVoteAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating/updating vote: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
        // 1.2. Lấy danh sách đánh giá phim theo phim
        [HttpGet("movie/{movieId}")]
        public async Task<IActionResult> GetVotesByMovie(int movieId)
        {
            try
            {
                var result = await _voteService.GetVotesByMovieAsync(movieId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting votes by movie: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
        // 1.3. Lấy đánh giá của 1 người dùng cho 1 phim
        [HttpGet("user/{userId}/movie/{movieId}")]
        [Authorize]
        public async Task<IActionResult> GetVoteByUserAndMovie(int userId, int movieId)
        {
            try
            {
                var result = await _voteService.GetVoteByUserAndMovieAsync(userId, movieId);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting vote by user and movie: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
        // 1.4. Cập nhật vote phim
        [HttpPut("{voteId}")]
        [Authorize]
        public async Task<IActionResult> Update(int voteId, [FromBody] VoteCreateUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid) 
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    return BadRequest(new { message = "Validation failed", errors });
                }

                var result = await _voteService.UpdateVoteAsync(voteId, dto);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating vote: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
        // 1.5. Xoá vote phim
        [HttpDelete("{voteId}")]
        [Authorize]
        public async Task<IActionResult> Delete(int voteId)
        {
            try
            {
                var success = await _voteService.DeleteVoteAsync(voteId);
                if (!success) return NotFound();
                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting vote: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
        // 2.1. Thống kê rating theo mức sao
        [HttpGet("movie/{movieId}/stats")]
        public async Task<IActionResult> GetMovieVoteStats(int movieId)
        {
            try
            {
                var result = await _voteService.GetMovieVoteStatsAsync(movieId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting movie vote stats: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
        // API quản trị: Lấy tất cả votes với filter
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] int? movieId, [FromQuery] int? userId, [FromQuery] int? minRating, [FromQuery] int? maxRating, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                var result = await _voteService.GetAllVotesAsync(movieId, userId, minRating, maxRating, fromDate, toDate);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting all votes: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
        // API quản trị: Phê duyệt hoặc gắn cờ đánh giá (dummy, không làm gì)
        [HttpPut("{voteId}/moderate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Moderate(int voteId, [FromBody] VoteModerateDto dto)
        {
            try
            {
                var success = await _voteService.ModerateVoteAsync(voteId, dto);
                if (!success) return NotFound();
                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error moderating vote: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
} 