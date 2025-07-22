using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs.CityDTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BookingTicketSysten.Services.CityServices
{
    public class CityService : ICityService
    {
        private readonly MovieTicketBookingSystemContext _context;

        public CityService(MovieTicketBookingSystemContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CityDto>> GetAllCitiesAsync()
        {
            var cities = await _context.Cities
                .Include(c => c.Cinemas)
                .Select(c => new CityDto
                {
                    CityId = c.CityId,
                    Name = c.Name,
                    CinemaCount = c.Cinemas.Count,
                    Cinemas = c.Cinemas.Select(cinema => new CinemaInfoDto
                    {
                        CinemaId = cinema.CinemaId,
                        Name = cinema.Name,
                        Address = cinema.Address,
                        ContactInfo = cinema.ContactInfo,
                        CreatedAt = cinema.CreatedAt,
                        ModifiedAt = cinema.ModifiedAt
                    }).ToList()
                })
                .ToListAsync();

            return cities;
        }

        public async Task<CityDto> GetCityByIdAsync(int cityId)
        {
            var city = await _context.Cities
                .Include(c => c.Cinemas)
                .Where(c => c.CityId == cityId)
                .Select(c => new CityDto
                {
                    CityId = c.CityId,
                    Name = c.Name,
                    CinemaCount = c.Cinemas.Count,
                    Cinemas = c.Cinemas.Select(cinema => new CinemaInfoDto
                    {
                        CinemaId = cinema.CinemaId,
                        Name = cinema.Name,
                        Address = cinema.Address,
                        ContactInfo = cinema.ContactInfo,
                        CreatedAt = cinema.CreatedAt,
                        ModifiedAt = cinema.ModifiedAt
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            return city;
        }

        public async Task<CityDto> GetCityByNameAsync(string cityName)
        {
            var city = await _context.Cities
                .Include(c => c.Cinemas)
                .Where(c => c.Name.ToLower() == cityName.ToLower())
                .Select(c => new CityDto
                {
                    CityId = c.CityId,
                    Name = c.Name,
                    CinemaCount = c.Cinemas.Count,
                    Cinemas = c.Cinemas.Select(cinema => new CinemaInfoDto
                    {
                        CinemaId = cinema.CinemaId,
                        Name = cinema.Name,
                        Address = cinema.Address,
                        ContactInfo = cinema.ContactInfo,
                        CreatedAt = cinema.CreatedAt,
                        ModifiedAt = cinema.ModifiedAt
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            return city;
        }

        public async Task<CityDto> CreateCityAsync(CityCreateUpdateDto cityDto)
        {
            // Check if city name already exists
            var existingCity = await _context.Cities
                .FirstOrDefaultAsync(c => c.Name.ToLower() == cityDto.Name.ToLower());

            if (existingCity != null)
                throw new InvalidOperationException($"City with name '{cityDto.Name}' already exists");

            var city = new City
            {
                Name = cityDto.Name.Trim()
            };

            _context.Cities.Add(city);
            await _context.SaveChangesAsync();

            return await GetCityByIdAsync(city.CityId);
        }

        public async Task<CityDto> UpdateCityAsync(int cityId, CityCreateUpdateDto cityDto)
        {
            var city = await _context.Cities.FindAsync(cityId);
            if (city == null)
                throw new ArgumentException("City not found");

            // Check if the new name conflicts with another city
            var existingCity = await _context.Cities
                .FirstOrDefaultAsync(c => c.CityId != cityId && c.Name.ToLower() == cityDto.Name.ToLower());

            if (existingCity != null)
                throw new InvalidOperationException($"City with name '{cityDto.Name}' already exists");

            city.Name = cityDto.Name.Trim();
            await _context.SaveChangesAsync();

            return await GetCityByIdAsync(cityId);
        }

        public async Task<bool> DeleteCityAsync(int cityId)
        {
            var city = await _context.Cities
                .Include(c => c.Cinemas)
                .FirstOrDefaultAsync(c => c.CityId == cityId);

            if (city == null)
                return false;

            // Check if city has cinemas
            if (city.Cinemas.Any())
                throw new InvalidOperationException($"Cannot delete city '{city.Name}' because it has {city.Cinemas.Count} cinema(s)");

            _context.Cities.Remove(city);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<CityDto>> SearchCitiesAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetAllCitiesAsync();

            var cities = await _context.Cities
                .Include(c => c.Cinemas)
                .Where(c => c.Name.ToLower().Contains(searchTerm.ToLower()))
                .Select(c => new CityDto
                {
                    CityId = c.CityId,
                    Name = c.Name,
                    CinemaCount = c.Cinemas.Count,
                    Cinemas = c.Cinemas.Select(cinema => new CinemaInfoDto
                    {
                        CinemaId = cinema.CinemaId,
                        Name = cinema.Name,
                        Address = cinema.Address,
                        ContactInfo = cinema.ContactInfo,
                        CreatedAt = cinema.CreatedAt,
                        ModifiedAt = cinema.ModifiedAt
                    }).ToList()
                })
                .ToListAsync();

            return cities;
        }

        public async Task<bool> CityExistsAsync(int cityId)
        {
            return await _context.Cities.AnyAsync(c => c.CityId == cityId);
        }

        public async Task<bool> CityNameExistsAsync(string cityName)
        {
            return await _context.Cities.AnyAsync(c => c.Name.ToLower() == cityName.ToLower());
        }
    }
} 