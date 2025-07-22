using BookingTicketSysten.Models.DTOs.UserDTOs;
using BookingTicketSysten.Services.UserSerivce;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProjectHouseWithLeaves.Helper.PasswordHasing;

namespace BookingTicketSysten.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUserAsync()
        {
            var users = await _userService.GetAllUserAsync();
            if (!users.Any())
            {
                return Ok(new
                {
                    Message = "No users found"
                });
            }
            return Ok(new
            {
                Message = "Success",
                data = users
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromForm] UserCreateDTOs userCreateDTO)
        {
            var result = await _userService.CreateUserAsync(userCreateDTO);
            if (result == null)
            {
                return BadRequest(new { message = "Email already exists" });
            }
            return Ok(new { message = "Account created successfully" });
        }

        [HttpPut("{email}")]
        public async Task<IActionResult> UpdateUserByEmail(string email, [FromForm] UserUpdateDTOs userUpdateDTO)
        {
            var result = await _userService.UpdateUserAsync(email, userUpdateDTO);
            if (result == null)
            {
                return BadRequest(new { message = "Email not found" });
            }
            return Ok(new
            {
                message = "Update successful",
                data = userUpdateDTO
            });
        }

        [HttpGet("{email}")]
        public async Task<IActionResult> GetUserByEmail(string email)
        {
            var user = await _userService.GetUserByEmailAsync(email);
            if (user != null)
            {
                return Ok(new
                {
                    Message = "Success",
                    data = user
                });
            }
            return Ok(new
            {
                Message = "Failure - data not found"
            });
        }

        [HttpDelete("{email}")]
        public async Task<IActionResult> DeleteUserByEmail(string email)
        {
            var result = await _userService.DeleteUserAsync(email);
            if (result)
            {
                return Ok(new
                {
                    Message = "User deleted successfully"
                });
            }
            return Ok(new
            {
                Message = "Failed to delete user"
            });
        }

        [HttpPost("update-password-forgetpassword")]
        public async Task<IActionResult> UpdatePasswordByEmail([FromBody] UpdatePasswordDTO updatePasswordDTO)
        {
            if (updatePasswordDTO.Password != updatePasswordDTO.ConfirmPassword)
            {
                return BadRequest(new
                {
                    Message = "Password and confirm password do not match"
                });
            }
            var result = await _userService.UpdatePasswordAsync(updatePasswordDTO.Email, updatePasswordDTO.Password);
            if (result == null)
            {
                return BadRequest(new { message = "Email not found" });
            }
            return Ok(new
            {
                Message = "Password updated successfully"
            });
        }

        [HttpPost("change-password-upadateprofile")]
        public async Task<IActionResult> ChangePasswordByEmail([FromBody] ChangePasswordDtos changePasswordDtos)
        {
            var user = await _userService.GetUserByEmailAsync(changePasswordDtos.Email);
            if (user == null)
            {
                return BadRequest(new { message = "Email not found" });
            }

            var passwordEnter = PasswordHassing.ComputeSha256Hash(changePasswordDtos.OldPassword);
            if (user.PasswordHash != passwordEnter)
            {
                return BadRequest(new { message = "Incorrect old password" });
            }

            if (changePasswordDtos.Password != changePasswordDtos.ConfirmPassword)
            {
                return BadRequest(new { message = "New password and confirm password do not match" });
            }

            var result = await _userService.UpdatePasswordAsync(changePasswordDtos.Email, changePasswordDtos.Password);
            if (result == null)
            {
                return BadRequest(new { message = "Email not found" });
            }
            return Ok(new
            {
                Message = "Password changed successfully"
            });
        }
    }
}
