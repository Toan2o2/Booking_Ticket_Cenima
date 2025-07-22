using BookingTicketSysten.Models.DTOs.MovieFavoriteDTOs;
using BookingTicketSysten.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingTicketSysten.Services.MovieServices
{
    public interface IMovieFavoriteService
    {
        Task<MovieFavoriteDto> AddFavoriteAsync(MovieFavoriteCreateDto dto);
        Task<bool> RemoveFavoriteAsync(int userId, int movieId);
        Task<bool> RemoveFavoriteByIdAsync(int movieFavoriteId);
        Task<bool> CheckFavoriteAsync(int userId, int movieId);
        Task<IEnumerable<MovieFavoriteDto>> GetFavoritesByUserAsync(int userId);
        Task<int> GetFavoriteCountByMovieAsync(int movieId);
        Task<IEnumerable<MovieFavoriteTopDto>> GetTopFavoritesAsync(int limit, DateTime? fromDate, DateTime? toDate);
        Task<IEnumerable<MovieDto>> GetTopFavoriteMoviesAsync(int limit, DateTime? fromDate, DateTime? toDate);
        Task<IEnumerable<MovieFavoriteDto>> GetAllFavoritesAsync(int? userId, int? movieId, DateTime? fromDate, DateTime? toDate, string sort);
    }
} 