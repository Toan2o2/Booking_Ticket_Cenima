using BookingTicketSysten.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingTicketSysten.Services.GenerService
{
    public interface IGenreService
    {
        Task<IEnumerable<GenreDto>> GetAllAsync();
        Task<GenreDto?> GetByIdAsync(int id);
        Task<GenreDto> CreateAsync(GenreCreateUpdateDto dto);
        Task<GenreDto?> UpdateAsync(int id, GenreCreateUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}