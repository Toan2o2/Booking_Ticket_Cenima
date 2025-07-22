using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs.UserDTOs;

namespace BookingTicketSysten.Services.UserSerivce
{
    public interface IUserService
    {
        Task<IEnumerable<UserDisplayDTOs>> GetAllUserAsync();
        Task<User?> CreateUserAsync(UserCreateDTOs userCreateDTO);
        Task<UserDisplayDTOs?> UpdateUserAsync(string email, UserUpdateDTOs classDto);
        Task<bool> DeleteUserAsync(string email);
        Task<User?> GetUserByEmailAndPasswordAsync(string email, string password);
        Task<User?> GetUserByEmailAsync(string email);
        Task<UserUpdateDTOs?> UpdatePasswordAsync(string email, string password);
    }
}
