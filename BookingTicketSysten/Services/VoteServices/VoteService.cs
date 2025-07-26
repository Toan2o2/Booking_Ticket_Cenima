using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs.VoteDTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BookingTicketSysten.Services.VoteServices
{
    public class VoteService : IVoteService
    {
        private readonly MovieTicketBookingSystemContext _context;
        public VoteService(MovieTicketBookingSystemContext context)
        {
            _context = context;
        }

        // Thêm method kiểm tra quyền đánh giá
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

        public async Task<VoteDto> CreateOrUpdateVoteAsync(VoteCreateUpdateDto dto)
        {
            // Kiểm tra quyền trước
            var hasWatched = await HasWatchedMovieAsync(dto.UserId, dto.MovieId);
            if (!hasWatched)
            {
                throw new InvalidOperationException("Bạn cần đặt và xem phim trước khi đánh giá.");
            }

            var vote = await _context.Votes.FirstOrDefaultAsync(v => v.MovieId == dto.MovieId && v.UserId == dto.UserId);
            if (vote == null)
            {
                vote = new Vote
                {
                    MovieId = dto.MovieId,
                    UserId = dto.UserId,
                    RatingValue = dto.RatingValue,
                    VoteTime = DateTime.UtcNow
                };
                _context.Votes.Add(vote);
            }
            else
            {
                vote.RatingValue = dto.RatingValue;
                vote.VoteTime = DateTime.UtcNow;
            }
            
            // Lưu vote trước
            await _context.SaveChangesAsync();
            
            // Cập nhật rating của phim
            await UpdateMovieRatingAsync(dto.MovieId);
            
            return MapToDto(vote);
        }
        
        // Phương thức mới để cập nhật rating của phim
        private async Task UpdateMovieRatingAsync(int movieId)
        {
            try
            {
                // Tính toán rating trung bình từ tất cả vote của phim
                var votes = await _context.Votes
                    .Where(v => v.MovieId == movieId)
                    .ToListAsync();
                
                // Tính trung bình rating với cast tường minh sang decimal
                decimal averageRating = votes.Any() 
                    ? (decimal)Math.Round(votes.Average(v => (decimal)v.RatingValue), 1) // Cast sang decimal
                    : 0m; // Sử dụng 0m để chỉ định decimal literal
                
                // Lấy và cập nhật thông tin phim
                var movie = await _context.Movies.FindAsync(movieId);
                if (movie != null)
                {
                    movie.Rating = averageRating;
                    movie.ModifiedAt = DateTime.UtcNow;
                    
                    // Lưu thay đổi vào database
                    await _context.SaveChangesAsync();
                    
                    Console.WriteLine($"Đã cập nhật rating của phim {movieId}: {averageRating}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi cập nhật rating phim: {ex.Message}");
                // Không ném ngoại lệ để không ảnh hưởng đến flow chính
            }
        }
        
        public async Task<IEnumerable<VoteDto>> GetVotesByMovieAsync(int movieId)
        {
            var votes = await _context.Votes.Where(v => v.MovieId == movieId).ToListAsync();
            return votes.Select(MapToDto);
        }
        public async Task<VoteDto?> GetVoteByUserAndMovieAsync(int userId, int movieId)
        {
            var vote = await _context.Votes.FirstOrDefaultAsync(v => v.UserId == userId && v.MovieId == movieId);
            return vote == null ? null : MapToDto(vote);
        }
        public async Task<VoteDto?> UpdateVoteAsync(int voteId, VoteCreateUpdateDto dto)
        {
            var vote = await _context.Votes.FindAsync(voteId);
            if (vote == null) return null;
            vote.RatingValue = dto.RatingValue;
            vote.VoteTime = DateTime.UtcNow;
            
            // Lưu vote trước
            await _context.SaveChangesAsync();
            
            // Cập nhật rating của phim
            await UpdateMovieRatingAsync(vote.MovieId);
            
            return MapToDto(vote);
        }
        public async Task<bool> DeleteVoteAsync(int voteId)
        {
            var vote = await _context.Votes.FindAsync(voteId);
            if (vote == null) return false;
            
            // Lưu lại movie ID trước khi xóa vote
            int movieId = vote.MovieId;
            
            _context.Votes.Remove(vote);
            await _context.SaveChangesAsync();
            
            // Cập nhật lại rating của phim sau khi xóa vote
            await UpdateMovieRatingAsync(movieId);
            
            return true;
        }
        public async Task<VoteStatsDto> GetMovieVoteStatsAsync(int movieId)
        {
            var votes = await _context.Votes.Where(v => v.MovieId == movieId).ToListAsync();
            var stats = new VoteStatsDto
            {
                MovieId = movieId,
                TotalVotes = votes.Count,
                AverageRating = votes.Count > 0 ? votes.Average(v => v.RatingValue) : 0,
                StarCounts = votes.GroupBy(v => v.RatingValue).ToDictionary(g => g.Key, g => g.Count())
            };
            for (int i = 1; i <= 5; i++)
            {
                if (!stats.StarCounts.ContainsKey(i)) stats.StarCounts[i] = 0;
            }
            return stats;
        }
        public async Task<IEnumerable<VoteDto>> GetAllVotesAsync(int? movieId, int? userId, int? minRating, int? maxRating, DateTime? fromDate, DateTime? toDate)
        {
            var query = _context.Votes.AsQueryable();
            if (movieId.HasValue) query = query.Where(v => v.MovieId == movieId);
            if (userId.HasValue) query = query.Where(v => v.UserId == userId);
            if (minRating.HasValue) query = query.Where(v => v.RatingValue >= minRating);
            if (maxRating.HasValue) query = query.Where(v => v.RatingValue <= maxRating);
            if (fromDate.HasValue) query = query.Where(v => v.VoteTime >= fromDate);
            if (toDate.HasValue) query = query.Where(v => v.VoteTime <= toDate);
            var votes = await query.ToListAsync();
            return votes.Select(MapToDto);
        }
        public async Task<bool> ModerateVoteAsync(int voteId, VoteModerateDto dto)
        {
            // Không làm gì vì không có trường kiểm duyệt
            return true;
        }
        private static VoteDto MapToDto(Vote vote)
        {
            return new VoteDto
            {
                VoteId = vote.VoteId,
                MovieId = vote.MovieId,
                UserId = vote.UserId,
                RatingValue = vote.RatingValue,
                VoteTime = vote.VoteTime
            };
        }
    }
} 