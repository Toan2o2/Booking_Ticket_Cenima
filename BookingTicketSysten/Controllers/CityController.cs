using BookingTicketSysten.Models.DTOs.CityDTOs;
using BookingTicketSysten.Services.CityServices;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingTicketSysten.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CityController : ControllerBase
    {
        private readonly ICityService _cityService;

        public CityController(ICityService cityService)
        {
            _cityService = cityService;
        }

        /// <summary>
        /// Get all cities
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CityDto>>> GetAllCities()
        {
            try
            {
                var cities = await _cityService.GetAllCitiesAsync();
                return Ok(cities);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Get city by ID
        /// </summary>
        [HttpGet("{cityId}")]
        public async Task<ActionResult<CityDto>> GetCityById(int cityId)
        {
            try
            {
                var city = await _cityService.GetCityByIdAsync(cityId);
                if (city == null)
                    return NotFound(new { message = "City not found" });

                return Ok(city);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Get city by name
        /// </summary>
        [HttpGet("name/{cityName}")]
        public async Task<ActionResult<CityDto>> GetCityByName(string cityName)
        {
            try
            {
                var city = await _cityService.GetCityByNameAsync(cityName);
                if (city == null)
                    return NotFound(new { message = $"City '{cityName}' not found" });

                return Ok(city);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Search cities by name
        /// </summary>
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<CityDto>>> SearchCities([FromQuery] string q)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(q))
                    return BadRequest(new { message = "Search term is required" });

                var cities = await _cityService.SearchCitiesAsync(q);
                return Ok(cities);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Create a new city
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<CityDto>> CreateCity([FromBody] CityCreateUpdateDto cityDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var city = await _cityService.CreateCityAsync(cityDto);
                return CreatedAtAction(nameof(GetCityById), new { cityId = city.CityId }, city);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Update city
        /// </summary>
        [HttpPut("{cityId}")]
        public async Task<ActionResult<CityDto>> UpdateCity(int cityId, [FromBody] CityCreateUpdateDto cityDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var city = await _cityService.UpdateCityAsync(cityId, cityDto);
                return Ok(city);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete city
        /// </summary>
        [HttpDelete("{cityId}")]
        public async Task<ActionResult> DeleteCity(int cityId)
        {
            try
            {
                var result = await _cityService.DeleteCityAsync(cityId);
                if (!result)
                    return NotFound(new { message = "City not found" });

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Check if city exists
        /// </summary>
        [HttpGet("{cityId}/exists")]
        public async Task<ActionResult> CityExists(int cityId)
        {
            try
            {
                var exists = await _cityService.CityExistsAsync(cityId);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Check if city name exists
        /// </summary>
        [HttpGet("name-exists")]
        public async Task<ActionResult> CityNameExists([FromQuery] string name)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                    return BadRequest(new { message = "City name is required" });

                var exists = await _cityService.CityNameExistsAsync(name);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
} 