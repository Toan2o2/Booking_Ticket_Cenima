using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace BookingTicketSysten.Services.GenerService
{
    public class GenreService : IGenreService
    {
        private readonly MovieTicketBookingSystemContext _context;
        public GenreService(MovieTicketBookingSystemContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<GenreDto>> GetAllAsync()
        {
            var genres = await _context.Genres.ToListAsync();
            return genres.Select(g => new GenreDto
            {
                GenreId = g.GenreId,
                Name = g.Name
            });
        }
        public async Task<GenreDto?> GetByIdAsync(int id)
        {
            var g = await _context.Genres.FindAsync(id);
            if (g == null) return null;
            return new GenreDto
            {
                GenreId = g.GenreId,
                Name = g.Name
            };
        }
        public async Task<GenreDto> CreateAsync(GenreCreateUpdateDto dto)
        {
            if (await _context.Genres.AnyAsync(x => x.Name == dto.Name))
                throw new Exception("Thể loại đã tồn tại!");
            var genre = new Genre { Name = dto.Name };
            _context.Genres.Add(genre);
            await _context.SaveChangesAsync();
            return new GenreDto { GenreId = genre.GenreId, Name = genre.Name };
        }
        public async Task<GenreDto?> UpdateAsync(int id, GenreCreateUpdateDto dto)
        {
            var existing = await _context.Genres.FindAsync(id);
            if (existing == null) return null;
            if (await _context.Genres.AnyAsync(x => x.Name == dto.Name && x.GenreId != id))
                throw new Exception("Thể loại đã tồn tại!");
            existing.Name = dto.Name;
            await _context.SaveChangesAsync();
            return new GenreDto { GenreId = existing.GenreId, Name = existing.Name };
        }
        public async Task<bool> DeleteAsync(int id)
        {
            var genre = await _context.Genres.Include(g => g.MovieGenres).FirstOrDefaultAsync(g => g.GenreId == id);
            if (genre == null) return false;
            if (genre.MovieGenres.Any())
                throw new Exception("Không thể xóa thể loại này vì đang liên kết với phim!");
            _context.Genres.Remove(genre);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}