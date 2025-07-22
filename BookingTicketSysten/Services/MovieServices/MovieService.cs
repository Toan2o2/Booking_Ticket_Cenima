using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs;
using BookingTicketSysten.Services.StoreService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace BookingTicketSysten.Services.MovieServices
{
    public class MovieService : IMovieService
    {
        private readonly MovieTicketBookingSystemContext _context;
        private readonly IStorageService _storageService;
        public MovieService(MovieTicketBookingSystemContext context, IStorageService storageService)
        {
            _context = context;
            _storageService = storageService;
        }
        private MovieDto MapToMovieDto(Movie m)
        {
            return new MovieDto
            {
                MovieId = m.MovieId,
                Title = m.Title,
                Description = m.Description,
                Duration = m.Duration,
                Language = m.Language,
                ReleaseDate = m.ReleaseDate,
                TrailerUrl = m.TrailerUrl,
                PosterUrl = m.PosterUrl,
                Rating = m.Rating,
                Genres = m.MovieGenres?.Select(g => new GenreDto { GenreId = g.Genre.GenreId, Name = g.Genre.Name }).ToList() ?? new List<GenreDto>(),
                Actors = m.MovieActors?.Select(a => new PersonDto
                {
                    PersonId = a.Person.PersonId,
                    Name = a.Person.Name,
                    DateOfBirth = a.Person.DateOfBirth,
                    Biography = a.Person.Biography,
                    Nationality = a.Person.Nationality,
                    PhotoUrl = a.Person.PhotoUrl
                }).ToList() ?? new List<PersonDto>(),
                Directors = m.MovieDirectors?.Select(d => new PersonDto
                {
                    PersonId = d.Person.PersonId,
                    Name = d.Person.Name,
                    DateOfBirth = d.Person.DateOfBirth,
                    Biography = d.Person.Biography,
                    Nationality = d.Person.Nationality,
                    PhotoUrl = d.Person.PhotoUrl
                }).ToList() ?? new List<PersonDto>()
            };
        }
        public async Task<IEnumerable<MovieDto>> GetAllAsync()
        {
            var movies = await _context.Movies
                .Include(m => m.MovieGenres).ThenInclude(mg => mg.Genre)
                .Include(m => m.MovieActors).ThenInclude(ma => ma.Person)
                .Include(m => m.MovieDirectors).ThenInclude(md => md.Person)
                .ToListAsync();
            return movies.Select(MapToMovieDto);
        }
        public async Task<MovieDto?> GetByIdAsync(int id)
        {
            var m = await _context.Movies
                .Include(m => m.MovieGenres).ThenInclude(mg => mg.Genre)
                .Include(m => m.MovieActors).ThenInclude(ma => ma.Person)
                .Include(m => m.MovieDirectors).ThenInclude(md => md.Person)
                .FirstOrDefaultAsync(m => m.MovieId == id);
            if (m == null) return null;
            return MapToMovieDto(m);
        }
        public async Task<MovieDto> CreateAsync(MovieCreateUpdateDto dto)
        {
            if (await _context.Movies.AnyAsync(x => x.Title == dto.Title && x.ReleaseDate == dto.ReleaseDate))
                throw new Exception("Phim này đã tồn tại!");
            var movie = new Movie
            {
                Title = dto.Title,
                Description = dto.Description,
                Duration = dto.Duration,
                Language = dto.Language,
                ReleaseDate = dto.ReleaseDate,
                TrailerUrl = dto.TrailerUrl,
                Rating = dto.Rating,
                CreatedAt = DateTime.UtcNow
            };
            if (dto.Poster != null)
            {
                var url = await _storageService.UploadFileAsync(dto.Poster);
                movie.PosterUrl = url;
            }
            // Xử lý liên kết genres
            if (dto.GenreIds != null)
            {
                foreach (var genreId in dto.GenreIds.Distinct())
                {
                    if (!await _context.Genres.AnyAsync(g => g.GenreId == genreId))
                        throw new Exception($"Thể loại với id {genreId} không tồn tại!");
                    movie.MovieGenres.Add(new MovieGenre { GenreId = genreId });
                }
            }
            // Xử lý liên kết actors
            if (dto.ActorIds != null)
            {
                foreach (var actorId in dto.ActorIds.Distinct())
                {
                    if (!await _context.People.AnyAsync(p => p.PersonId == actorId))
                        throw new Exception($"Diễn viên với id {actorId} không tồn tại!");
                    movie.MovieActors.Add(new MovieActor { PersonId = actorId });
                }
            }
            // Xử lý liên kết directors
            if (dto.DirectorIds != null)
            {
                foreach (var directorId in dto.DirectorIds.Distinct())
                {
                    if (!await _context.People.AnyAsync(p => p.PersonId == directorId))
                        throw new Exception($"Đạo diễn với id {directorId} không tồn tại!");
                    movie.MovieDirectors.Add(new MovieDirector { PersonId = directorId });
                }
            }
            _context.Movies.Add(movie);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(movie.MovieId) ?? throw new Exception("Lỗi tạo phim");
        }
        public async Task<MovieDto?> UpdateAsync(int id, MovieCreateUpdateDto dto)
        {
            var existing = await _context.Movies
                .Include(m => m.MovieGenres)
                .Include(m => m.MovieActors)
                .Include(m => m.MovieDirectors)
                .FirstOrDefaultAsync(m => m.MovieId == id);
            if (existing == null) return null;
            if (await _context.Movies.AnyAsync(x => x.Title == dto.Title && x.ReleaseDate == dto.ReleaseDate && x.MovieId != id))
                throw new Exception("Phim này đã tồn tại!");
            existing.Title = dto.Title;
            existing.Description = dto.Description;
            existing.Duration = dto.Duration;
            existing.Language = dto.Language;
            existing.ReleaseDate = dto.ReleaseDate;
            existing.TrailerUrl = dto.TrailerUrl;
            existing.Rating = dto.Rating;
            if (dto.Poster != null)
            {
                var url = await _storageService.UploadFileAsync(dto.Poster);
                existing.PosterUrl = url;
            }
            existing.ModifiedAt = DateTime.UtcNow;
            // Cập nhật liên kết genres
            existing.MovieGenres.Clear();
            if (dto.GenreIds != null)
            {
                foreach (var genreId in dto.GenreIds.Distinct())
                {
                    if (!await _context.Genres.AnyAsync(g => g.GenreId == genreId))
                        throw new Exception($"Thể loại với id {genreId} không tồn tại!");
                    existing.MovieGenres.Add(new MovieGenre { MovieId = id, GenreId = genreId });
                }
            }
            // Cập nhật liên kết actors
            existing.MovieActors.Clear();
            if (dto.ActorIds != null)
            {
                foreach (var actorId in dto.ActorIds.Distinct())
                {
                    if (!await _context.People.AnyAsync(p => p.PersonId == actorId))
                        throw new Exception($"Diễn viên với id {actorId} không tồn tại!");
                    existing.MovieActors.Add(new MovieActor { MovieId = id, PersonId = actorId });
                }
            }
            // Cập nhật liên kết directors
            existing.MovieDirectors.Clear();
            if (dto.DirectorIds != null)
            {
                foreach (var directorId in dto.DirectorIds.Distinct())
                {
                    if (!await _context.People.AnyAsync(p => p.PersonId == directorId))
                        throw new Exception($"Đạo diễn với id {directorId} không tồn tại!");
                    existing.MovieDirectors.Add(new MovieDirector { MovieId = id, PersonId = directorId });
                }
            }
            await _context.SaveChangesAsync();
            return await GetByIdAsync(existing.MovieId);
        }
        public async Task<bool> DeleteAsync(int id)
        {
            var movie = await _context.Movies.Include(m => m.Shows).Include(m => m.MovieActors).Include(m => m.MovieDirectors).FirstOrDefaultAsync(m => m.MovieId == id);
            if (movie == null) return false;
            if (movie.Shows.Any())
                throw new Exception("Không thể xóa phim này vì đã có suất chiếu!");
            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<IEnumerable<MovieDto>> GetByGenreIdAsync(int genreId)
        {
            var movieIds = await _context.MovieGenres
                .Where(mg => mg.GenreId == genreId)
                .Select(mg => mg.MovieId)
                .ToListAsync();

            var movies = await _context.Movies
                .Where(m => movieIds.Contains(m.MovieId))
                .Include(m => m.MovieGenres).ThenInclude(mg => mg.Genre)
                .Include(m => m.MovieActors).ThenInclude(ma => ma.Person)
                .Include(m => m.MovieDirectors).ThenInclude(md => md.Person)
                .ToListAsync();

            return movies.Select(MapToMovieDto);
        }
        public async Task<IEnumerable<MovieDto>> GetByPersonIdAsync(int personId)
        {
            var actorMovieIds = await _context.MovieActors
                .Where(ma => ma.PersonId == personId)
                .Select(ma => ma.MovieId)
                .ToListAsync();
            var directorMovieIds = await _context.MovieDirectors
                .Where(md => md.PersonId == personId)
                .Select(md => md.MovieId)
                .ToListAsync();
            var allMovieIds = actorMovieIds.Union(directorMovieIds).Distinct().ToList();

            var movies = await _context.Movies
                .Where(m => allMovieIds.Contains(m.MovieId))
                .Include(m => m.MovieGenres).ThenInclude(mg => mg.Genre)
                .Include(m => m.MovieActors).ThenInclude(ma => ma.Person)
                .Include(m => m.MovieDirectors).ThenInclude(md => md.Person)
                .ToListAsync();

            return movies.Select(MapToMovieDto);
        }
    }
}