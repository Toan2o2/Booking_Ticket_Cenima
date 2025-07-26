using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs.CommentDTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BookingTicketSysten.Services.CommentServices
{
    public class CommentService : ICommentService
    {
        private readonly MovieTicketBookingSystemContext _context;
        public CommentService(MovieTicketBookingSystemContext context)
        {
            _context = context;
        }

        // Thêm method kiểm tra quyền bình luận
        public async Task<bool> HasWatchedMovieAsync(int userId, int movieId)
        {
            var booking = await _context.Bookings
                .Include(b => b.Show)
                .Where(b => b.UserId == userId && 
                           b.Show.MovieId == movieId && 
                           b.Status == "Confirmed")
                .FirstOrDefaultAsync();
            
            return booking != null;
        }

        public async Task<CommentDto> AddCommentAsync(CommentCreateDto dto)
        {
            // Kiểm tra quyền trước
            var hasWatched = await HasWatchedMovieAsync(dto.UserId, dto.MovieId);
            if (!hasWatched)
            {
                throw new InvalidOperationException("Bạn cần đặt và xem phim trước khi bình luận.");
            }

            int? parentCommentId = null;
            if (dto.ParentCommentId.HasValue)
            {
                var parent = await _context.Comments
                    .FirstOrDefaultAsync(c => c.CommentId == dto.ParentCommentId.Value && c.MovieId == dto.MovieId);
                if (parent == null)
                {
                    throw new Exception($"Parent comment with ID {dto.ParentCommentId.Value} does not exist for movie {dto.MovieId}");
                }
                parentCommentId = dto.ParentCommentId.Value;
            }
            
            var comment = new Comment
            {
                UserId = dto.UserId,
                MovieId = dto.MovieId,
                CommentText = dto.CommentText,
                ParentCommentId = parentCommentId,
                IsApproved = true // Comments mới cần được admin duyệt
            };
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            return MapToDto(comment);
        }
        public async Task<IEnumerable<CommentDto>> GetCommentsByMovieAsync(int movieId, int page, int pageSize, string sort, bool includeReplies, bool approvedOnly, bool isAdmin)
        {
            var query = _context.Comments
                .Include(c => c.User) // Include User information
                .Where(c => c.MovieId == movieId && c.ParentCommentId == null);
                
            if (approvedOnly && !isAdmin)
                query = query.Where(c => c.IsApproved == true);
                
            query = sort == "oldest" ? query.OrderBy(c => c.CommentId) : query.OrderByDescending(c => c.CommentId);
            var comments = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            var result = comments.Select(MapToDto).ToList();
            
            if (includeReplies)
            {
                foreach (var c in result)
                {
                    c.Replies = await GetRepliesRecursive(c.CommentId, approvedOnly && !isAdmin);
                }
            }
            return result;
        }
        
        private async Task<List<CommentDto>> GetRepliesRecursive(int parentId, bool approvedOnly)
        {
            var query = _context.Comments
                .Include(c => c.User) // Include User information
                .Where(c => c.ParentCommentId == parentId);
                
            if (approvedOnly)
                query = query.Where(c => c.IsApproved == true);
                
            query = query.OrderBy(c => c.CommentId);
            var replies = await query.ToListAsync();
            var result = replies.Select(MapToDto).ToList();
            
            foreach (var r in result)
            {
                r.Replies = await GetRepliesRecursive(r.CommentId, approvedOnly);
            }
            return result;
        }
        public async Task<CommentDto?> UpdateCommentAsync(int commentId, int userId, CommentUpdateDto dto, bool isAdmin)
        {
            var comment = await _context.Comments.FindAsync(commentId);
            if (comment == null) return null;
            if (!isAdmin && comment.UserId != userId) return null;
            comment.CommentText = dto.CommentText;
            await _context.SaveChangesAsync();
            return MapToDto(comment);
        }
        public async Task<bool> DeleteCommentAsync(int commentId, int userId, bool isAdmin)
        {
            var comment = await _context.Comments.FindAsync(commentId);
            if (comment == null) return false;
            if (!isAdmin && comment.UserId != userId) return false;
            comment.CommentText = "[Đã xoá]";
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> ApproveCommentAsync(int commentId)
        {
            var comment = await _context.Comments.FindAsync(commentId);
            if (comment == null) return false;
            comment.IsApproved = true;
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<IEnumerable<CommentDto>> GetAllCommentsAdminAsync(CommentAdminFilterDto filter)
        {
            var query = _context.Comments.AsQueryable();
            if (filter.UserId.HasValue) query = query.Where(c => c.UserId == filter.UserId);
            if (filter.MovieId.HasValue) query = query.Where(c => c.MovieId == filter.MovieId);
            if (filter.IsApproved.HasValue) query = query.Where(c => c.IsApproved == filter.IsApproved);
            query = filter.Sort == "oldest" ? query.OrderBy(c => c.CommentId) : query.OrderByDescending(c => c.CommentId);
            var comments = await query.ToListAsync();
            return comments.Select(MapToDto);
        }
        public async Task<IEnumerable<CommentDto>> GetCommentsByUserAsync(int userId)
        {
            var comments = await _context.Comments.Where(c => c.UserId == userId).OrderByDescending(c => c.CommentId).ToListAsync();
            return comments.Select(MapToDto);
        }
        public async Task<int> GetCommentCountByMovieAsync(int movieId)
        {
            return await _context.Comments.CountAsync(c => c.MovieId == movieId);
        }
        private static CommentDto MapToDto(Comment c)
        {
            return new CommentDto
            {
                CommentId = c.CommentId,
                UserId = c.UserId,
                MovieId = c.MovieId,
                CommentText = c.CommentText,
                ParentCommentId = c.ParentCommentId,
                IsApproved = c.IsApproved,
                CreatedAt = c.CreatedAt,
                ModifiedAt = c.ModifiedAt,
                UserName = c.User?.Name ?? "Unknown User" // Add user name
            };
        }
    }
} 