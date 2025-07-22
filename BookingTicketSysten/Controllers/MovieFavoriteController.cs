using BookingTicketSysten.Models.DTOs.MovieFavoriteDTOs;
using BookingTicketSysten.Services.MovieServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;
using System.Security.Claims;

namespace BookingTicketSysten.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MovieFavoriteController : ControllerBase
    {
        private readonly IMovieFavoriteService _service;
        public MovieFavoriteController(IMovieFavoriteService service)
        {
            _service = service;
        }
        
        // 1. Thêm phim vào danh sách yêu thích
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Add([FromBody] MovieFavoriteCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            
            // Lấy userId từ token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
            {
                return Unauthorized("Không thể xác định người dùng");
            }
            
            // Đảm bảo user chỉ có thể thêm yêu thích cho chính mình
            dto.UserId = currentUserId;
            
            var result = await _service.AddFavoriteAsync(dto);
            return Ok(result);
        }
        
        // 2. Xoá phim khỏi danh sách yêu thích (theo userId, movieId)
        [HttpDelete]
        [Authorize]
        public async Task<IActionResult> Remove([FromQuery] int movieId)
        {
            // Lấy userId từ token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
        {
                return Unauthorized("Không thể xác định người dùng");
            }
            
            var success = await _service.RemoveFavoriteAsync(currentUserId, movieId);
            if (!success) return NotFound();
            return Ok();
        }
        
        // Xoá theo MovieFavoriteId (tuỳ chọn)
        [HttpDelete("by-id/{movieFavoriteId}")]
        [Authorize]
        public async Task<IActionResult> RemoveById(int movieFavoriteId)
        {
            var success = await _service.RemoveFavoriteByIdAsync(movieFavoriteId);
            if (!success) return NotFound();
            return Ok();
        }
        
        // 3. Kiểm tra một phim có nằm trong danh sách yêu thích của người dùng hay không
        [HttpGet("check")]
        [Authorize]
        public async Task<IActionResult> Check([FromQuery] int movieId)
        {
            // Lấy userId từ token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
        {
                return Unauthorized("Không thể xác định người dùng");
            }
            
            var isFavorite = await _service.CheckFavoriteAsync(currentUserId, movieId);
            return Ok(new { isFavorite });
        }
        
        // 4. Lấy danh sách phim yêu thích của người dùng
        [HttpGet("user")]
        [Authorize]
        public async Task<IActionResult> GetByUser()
        {
            // Lấy userId từ token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
        {
                return Unauthorized("Không thể xác định người dùng");
            }
            
            var result = await _service.GetFavoritesByUserAsync(currentUserId);
            return Ok(result);
        }
        
        // 5. Lấy số lượng người yêu thích một phim
        [HttpGet("movie/{movieId}/count")]
        public async Task<IActionResult> GetCountByMovie(int movieId)
        {
            var count = await _service.GetFavoriteCountByMovieAsync(movieId);
            return Ok(new { movieId, count });
        }
        
        // 6. Thống kê phim được yêu thích nhiều nhất
        [HttpGet("top")]
        public async Task<IActionResult> GetTop([FromQuery] int limit = 10, [FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _service.GetTopFavoritesAsync(limit, fromDate, toDate);
            return Ok(result);
        }
        
        // 7. Lấy top phim yêu thích với thông tin đầy đủ
        [HttpGet("top-movies")]
        public async Task<IActionResult> GetTopMovies([FromQuery] int limit = 10, [FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var result = await _service.GetTopFavoriteMoviesAsync(limit, fromDate, toDate);
            return Ok(result);
        }
        
        // 8. Admin: Lấy toàn bộ danh sách yêu thích
        [HttpGet("/api/admin/favorites")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] int? userId, [FromQuery] int? movieId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] string sort = "latest")
        {
            var result = await _service.GetAllFavoritesAsync(userId, movieId, fromDate, toDate, sort);
            return Ok(result);
        }
    }
} 