using BookingTicketSysten.Models.DTOs.CommentDTOs;
using BookingTicketSysten.Services.CommentServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;
using System.Linq; // Added for SelectMany and Select
using System.Collections.Generic; // Added for List

namespace BookingTicketSysten.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _service;
        public CommentController(ICommentService service)
        {
            _service = service;
        }
        // 1. Thêm bình luận mới
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Add([FromBody] CommentCreateDto dto)
        {
            try
            {
                if (!ModelState.IsValid) 
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    return BadRequest(new { message = "Validation failed", errors });
                }

                // Log the incoming data
                Console.WriteLine($"Creating comment: MovieId={dto.MovieId}, UserId={dto.UserId}, Text={dto.CommentText?.Substring(0, Math.Min(50, dto.CommentText?.Length ?? 0))}...");

                var result = await _service.AddCommentAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating comment: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
        // 2. Lấy danh sách bình luận của một phim
        [HttpGet("movie/{movieId}")]
        public async Task<IActionResult> GetByMovie(int movieId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string sort = "newest", [FromQuery] bool includeReplies = true, [FromQuery] bool approvedOnly = true, [FromQuery] bool isAdmin = false)
        {
            try
            {
                var result = await _service.GetCommentsByMovieAsync(movieId, page, pageSize, sort, includeReplies, approvedOnly, isAdmin);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting comments: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
        // 3. Sửa bình luận
        [HttpPut("{commentId}")]
        [Authorize]
        public async Task<IActionResult> Update(int commentId, [FromQuery] int userId, [FromBody] CommentUpdateDto dto, [FromQuery] bool isAdmin = false)
        {
            try
            {
                var result = await _service.UpdateCommentAsync(commentId, userId, dto, isAdmin);
                if (result == null) return Forbid();
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating comment: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
        // 4. Xoá bình luận (xoá mềm)
        [HttpDelete("{commentId}")]
        [Authorize]
        public async Task<IActionResult> Delete(int commentId, [FromQuery] int userId, [FromQuery] bool isAdmin = false)
        {
            try
            {
                var success = await _service.DeleteCommentAsync(commentId, userId, isAdmin);
                if (!success) return Forbid();
                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting comment: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
        // 5. Admin: Duyệt bình luận
        [HttpPut("/api/admin/comments/{commentId}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Approve(int commentId)
        {
            try
            {
                var success = await _service.ApproveCommentAsync(commentId);
                if (!success) return NotFound();
                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error approving comment: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
        // 6. Admin: Lấy danh sách tất cả bình luận
        [HttpGet("/api/admin/comments")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAdmin([FromQuery] int? userId, [FromQuery] int? movieId, [FromQuery] bool? isApproved, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] string sort = "newest")
        {
            try
            {
                var filter = new CommentAdminFilterDto { UserId = userId, MovieId = movieId, IsApproved = isApproved, FromDate = fromDate, ToDate = toDate, Sort = sort };
                var result = await _service.GetAllCommentsAdminAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting admin comments: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
        // 7. Lấy danh sách bình luận của một người dùng
        [HttpGet("user/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetByUser(int userId)
        {
            try
            {
                var result = await _service.GetCommentsByUserAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user comments: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
        // 8. Thống kê số lượng bình luận của phim
        [HttpGet("movie/{movieId}/count")]
        public async Task<IActionResult> GetCountByMovie(int movieId)
        {
            try
            {
                var count = await _service.GetCommentCountByMovieAsync(movieId);
                return Ok(new { movieId, count });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting comment count: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        // Test endpoint để kiểm tra database connection
        [HttpGet("test")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                // Test basic database operations
                var testComment = await _service.GetCommentCountByMovieAsync(1);
                return Ok(new { 
                    message = "Database connection successful", 
                    testCount = testComment,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Database connection test failed: {ex.Message}");
                return StatusCode(500, new { 
                    message = "Database connection failed", 
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        // Test endpoint để tạo dữ liệu mẫu
        [HttpPost("seed-data")]
        public async Task<IActionResult> SeedSampleData()
        {
            try
            {
                var sampleComments = new List<CommentCreateDto>
                {
                    new CommentCreateDto
                    {
                        MovieId = 1,
                        UserId = 1,
                        CommentText = "Phim rất hay! Kịch bản hấp dẫn, diễn viên xuất sắc.",
                        ParentCommentId = null
                    },
                    new CommentCreateDto
                    {
                        MovieId = 1,
                        UserId = 1,
                        CommentText = "Đây là bình luận thứ hai để test.",
                        ParentCommentId = null
                    },
                    new CommentCreateDto
                    {
                        MovieId = 1,
                        UserId = 1,
                        CommentText = "Bình luận thứ ba với nội dung dài hơn để kiểm tra hiển thị.",
                        ParentCommentId = null
                    }
                };

                var createdComments = new List<CommentDto>();
                foreach (var comment in sampleComments)
                {
                    try
                    {
                        var created = await _service.AddCommentAsync(comment);
                        createdComments.Add(created);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error creating sample comment: {ex.Message}");
                    }
                }

                return Ok(new { 
                    message = "Đã tạo dữ liệu mẫu thành công", 
                    comments = createdComments,
                    count = createdComments.Count
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error seeding sample data: {ex.Message}");
                return StatusCode(500, new { 
                    message = "Lỗi khi tạo dữ liệu mẫu", 
                    error = ex.Message 
                });
            }
        }
    }
} 