using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs;
using BookingTicketSysten.Models.DTOs.PersonDTOs;
using BookingTicketSysten.Services.PersonServices;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace BookingTicketSysten.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PersonController : ControllerBase
    {
        private readonly IPersonService _personService;
        public PersonController(IPersonService personService)
        {
            _personService = personService;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _personService.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _personService.GetByIdAsync(id);
                if (result == null) return NotFound(new { mesage = "Không tìm thấy " });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] PersonCreateUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                var result = await _personService.CreateAsync(dto);
                return Ok(new { mesage = "Thêm thành công " });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] PersonCreateUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                var result = await _personService.UpdateAsync(id, dto);
                if (result == null) return NotFound(new { mesage = "Không tìm thấy " });
                return Ok(new { mesage = "Cập nhật thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var success = await _personService.DeleteAsync(id);
                if (!success) return NotFound(new { mesage = "Không tìm thấy " });
                return Ok(new { mesage = "Xóa thành công " });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpGet("actors")]
        public async Task<IActionResult> GetAllActors()
        {
            try
            {
                var result = await _personService.GetAllActorsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        [HttpGet("directors")]
        public async Task<IActionResult> GetAllDirectors()
        {
            try
            {
                var result = await _personService.GetAllDirectorsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
} 