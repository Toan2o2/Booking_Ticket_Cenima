using BookingTicketSysten.Models.DTOs.VoteDTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingTicketSysten.Services.VoteServices
{
    public interface IVoteService
    {
        Task<bool> HasWatchedMovieAsync(int userId, int movieId);
        Task<VoteDto> CreateOrUpdateVoteAsync(VoteCreateUpdateDto dto);
        Task<IEnumerable<VoteDto>> GetVotesByMovieAsync(int movieId);
        Task<VoteDto?> GetVoteByUserAndMovieAsync(int userId, int movieId);
        Task<VoteDto?> UpdateVoteAsync(int voteId, VoteCreateUpdateDto dto);
        Task<bool> DeleteVoteAsync(int voteId);
        Task<VoteStatsDto> GetMovieVoteStatsAsync(int movieId);
        Task<IEnumerable<VoteDto>> GetAllVotesAsync(int? movieId, int? userId, int? minRating, int? maxRating, DateTime? fromDate, DateTime? toDate);
        Task<bool> ModerateVoteAsync(int voteId, VoteModerateDto dto);
    }
} 