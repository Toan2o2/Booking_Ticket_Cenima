using BookingTicketSysten.Models.DTOs;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingTicketSysten.Services.MovieServices
{
    public interface IMovieService
    {
        Task<IEnumerable<MovieDto>> GetAllAsync();
        Task<MovieDto?> GetByIdAsync(int id);
        Task<MovieDto> CreateAsync(MovieCreateUpdateDto dto);
        Task<MovieDto?> UpdateAsync(int id, MovieCreateUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<MovieDto>> GetByGenreIdAsync(int genreId);
        Task<IEnumerable<MovieDto>> GetByPersonIdAsync(int personId);
    }
}