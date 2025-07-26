using BookingTicketSysten.Models.DTOs.CommentDTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingTicketSysten.Services.CommentServices
{
    public interface ICommentService
    {
        Task<bool> HasWatchedMovieAsync(int userId, int movieId);
        Task<CommentDto> AddCommentAsync(CommentCreateDto dto);
        Task<IEnumerable<CommentDto>> GetCommentsByMovieAsync(int movieId, int page, int pageSize, string sort, bool includeReplies, bool approvedOnly, bool isAdmin);
        Task<CommentDto?> UpdateCommentAsync(int commentId, int userId, CommentUpdateDto dto, bool isAdmin);
        Task<bool> DeleteCommentAsync(int commentId, int userId, bool isAdmin);
        Task<bool> ApproveCommentAsync(int commentId);
        Task<IEnumerable<CommentDto>> GetAllCommentsAdminAsync(CommentAdminFilterDto filter);
        Task<IEnumerable<CommentDto>> GetCommentsByUserAsync(int userId);
        Task<int> GetCommentCountByMovieAsync(int movieId);
    }
} 