using BookingTicketSysten.Models;
using BookingTicketSysten.Services.StoreService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;
using BookingTicketSysten.Models.DTOs.PersonDTOs;
using BookingTicketSysten.Models.DTOs;

namespace BookingTicketSysten.Services.PersonServices
{
    public class PersonService : IPersonService
    {
        private readonly MovieTicketBookingSystemContext _context;
        private readonly IStorageService _storageService;
        public PersonService(MovieTicketBookingSystemContext context, IStorageService storageService)
        {
            _context = context;
            _storageService = storageService;
        }
        public async Task<IEnumerable<PersonDto>> GetAllAsync()
        {
            var people = await _context.People
                .Include(p => p.MovieActors)
                .Include(p => p.MovieDirectors)
                .ToListAsync();
            return people.Select(p => new PersonDto
            {
                PersonId = p.PersonId,
                Name = p.Name,
                DateOfBirth = p.DateOfBirth,
                Biography = p.Biography,
                Nationality = p.Nationality,
                PhotoUrl = p.PhotoUrl,
                Role = p.MovieActors.Any() && p.MovieDirectors.Any() ? "both"
                    : p.MovieActors.Any() ? "actor"
                    : p.MovieDirectors.Any() ? "director" : "none"
            });
        }
        public async Task<PersonDetailDto?> GetByIdAsync(int id)
        {
            var p = await _context.People
                .Include(x => x.MovieActors).ThenInclude(ma => ma.Movie)
                .Include(x => x.MovieDirectors).ThenInclude(md => md.Movie)
                .FirstOrDefaultAsync(x => x.PersonId == id);
            if (p == null) return null;
            var moviesAsActor = p.MovieActors.Select(ma => new PersonMovieRoleDto
            {
                MovieId = ma.MovieId,
                MovieTitle = ma.Movie?.Title,
                RoleName = ma.RoleName
            }).ToList();
            var moviesAsDirector = p.MovieDirectors.Select(md => new PersonMovieRoleDto
            {
                MovieId = md.MovieId,
                MovieTitle = md.Movie?.Title,
                RoleName = "Đạo diễn"
            }).ToList();
            var role = p.MovieActors.Any() && p.MovieDirectors.Any() ? "both"
                : p.MovieActors.Any() ? "actor"
                : p.MovieDirectors.Any() ? "director" : "none";
            return new PersonDetailDto
            {
                PersonId = p.PersonId,
                Name = p.Name,
                DateOfBirth = p.DateOfBirth,
                Biography = p.Biography,
                Nationality = p.Nationality,
                PhotoUrl = p.PhotoUrl,
                Role = role,
                MoviesAsActor = moviesAsActor,
                MoviesAsDirector = moviesAsDirector
            };
        }
        public async Task<PersonDto> CreateAsync(PersonCreateUpdateDto dto)
        {
            if (await _context.People.AnyAsync(x => x.Name == dto.Name && x.DateOfBirth == dto.DateOfBirth))
                throw new Exception("Người này đã tồn tại!");
            var person = new Person
            {
                Name = dto.Name,
                DateOfBirth = dto.DateOfBirth,
                Biography = dto.Biography,
                Nationality = dto.Nationality,
                CreatedAt = DateTime.UtcNow
            };
            if (dto.Photo != null)
            {
                var url = await _storageService.UploadFileAsync(dto.Photo);
                person.PhotoUrl = url;
            }
            _context.People.Add(person);
            await _context.SaveChangesAsync();
            return new PersonDto
            {
                PersonId = person.PersonId,
                Name = person.Name,
                DateOfBirth = person.DateOfBirth,
                Biography = person.Biography,
                Nationality = person.Nationality,
                PhotoUrl = person.PhotoUrl
            };
        }
        public async Task<PersonDto?> UpdateAsync(int id, PersonCreateUpdateDto dto)
        {
            var existing = await _context.People.FindAsync(id);
            if (existing == null) return null;
            if (await _context.People.AnyAsync(x => x.Name == dto.Name && x.DateOfBirth == dto.DateOfBirth && x.PersonId != id))
                throw new Exception("Người này đã tồn tại!");
            existing.Name = dto.Name;
            existing.DateOfBirth = dto.DateOfBirth;
            existing.Biography = dto.Biography;
            existing.Nationality = dto.Nationality;
            if (dto.Photo != null)
            {
                var url = await _storageService.UploadFileAsync(dto.Photo);
                existing.PhotoUrl = url;
            }
            existing.ModifiedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return new PersonDto
            {
                PersonId = existing.PersonId,
                Name = existing.Name,
                DateOfBirth = existing.DateOfBirth,
                Biography = existing.Biography,
                Nationality = existing.Nationality,
                PhotoUrl = existing.PhotoUrl
            };
        }
        public async Task<bool> DeleteAsync(int id)
        {
            var person = await _context.People.Include(p => p.MovieActors).Include(p => p.MovieDirectors).FirstOrDefaultAsync(p => p.PersonId == id);
            if (person == null) return false;
            if (person.MovieActors.Any() || person.MovieDirectors.Any())
                throw new Exception("Không thể xóa người này vì đang liên kết với phim!");
            _context.People.Remove(person);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<IEnumerable<PersonDto>> GetAllActorsAsync()
        {
            var people = await _context.People
                .Include(p => p.MovieActors)
                .Include(p => p.MovieDirectors)
                .Where(p => p.MovieActors.Any())
                .ToListAsync();
            return people.Select(p => new PersonDto
            {
                PersonId = p.PersonId,
                Name = p.Name,
                DateOfBirth = p.DateOfBirth,
                Biography = p.Biography,
                Nationality = p.Nationality,
                PhotoUrl = p.PhotoUrl,
                Role = p.MovieDirectors.Any() ? "both" : "actor"
            });
        }
        public async Task<IEnumerable<PersonDto>> GetAllDirectorsAsync()
        {
            var people = await _context.People
                .Include(p => p.MovieActors)
                .Include(p => p.MovieDirectors)
                .Where(p => p.MovieDirectors.Any())
                .ToListAsync();
            return people.Select(p => new PersonDto
            {
                PersonId = p.PersonId,
                Name = p.Name,
                DateOfBirth = p.DateOfBirth,
                Biography = p.Biography,
                Nationality = p.Nationality,
                PhotoUrl = p.PhotoUrl,
                Role = p.MovieActors.Any() ? "both" : "director"
            });
        }
    }
}