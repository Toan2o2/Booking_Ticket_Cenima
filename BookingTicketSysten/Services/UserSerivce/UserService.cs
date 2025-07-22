using AutoMapper;
using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs.UserDTOs;
using Microsoft.EntityFrameworkCore;
using ProjectHouseWithLeaves.Helper.PasswordHasing;

namespace BookingTicketSysten.Services.UserSerivce
{
    public class UserService : IUserService
    {
        private readonly MovieTicketBookingSystemContext _context;
        private readonly IMapper _mapper;

        public UserService(IMapper mapper, MovieTicketBookingSystemContext context)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<User?> CreateUserAsync(UserCreateDTOs userCreateDTO)
        {
            var userExist = await _context.Users
               .SingleOrDefaultAsync(x => x.Email == userCreateDTO.Email);
            if (userExist != null)
            {
                return null;
            }
            var user = _mapper.Map<User>(userCreateDTO);
            user.PasswordHash = PasswordHassing.ComputeSha256Hash(userCreateDTO.PasswordHash);
            user.CreatedAt = DateTime.Now;
            user.RoleId = 2;
            await _context.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> DeleteUserAsync(string email)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return false;
            }
            user.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<UserDisplayDTOs>> GetAllUserAsync()
        {
            var users = await _context.Users.ToListAsync();
            var userDisplay = _mapper.Map<IEnumerable<UserDisplayDTOs>>(users);
            return userDisplay;
        }

        public async Task<User?> GetUserByEmailAndPasswordAsync(string email, string password)
        {
            var user = await _context.Users.Include(u => u.Role)
                .SingleOrDefaultAsync(x => x.Email == email && x.PasswordHash == PasswordHassing.ComputeSha256Hash(password));
            if (user == null)
            {
                return null;
            }
            return user;
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            var user = await _context.Users
               .Include(u => u.Role)
               .SingleOrDefaultAsync(x => x.Email == email);
            if (user == null)
            {
                return null;
            }
            return user;
        }

        public async Task<UserUpdateDTOs?> UpdatePasswordAsync(string email, string password)
        {
            var user = await _context.Users
               .SingleOrDefaultAsync(x => x.Email == email);
            if (user == null)
            {
                return null;
            }
            user.PasswordHash = PasswordHassing.ComputeSha256Hash(password);
            user.ModifiedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return _mapper.Map<UserUpdateDTOs>(user);
        }

        public async Task<UserDisplayDTOs?> UpdateUserAsync(string email, UserUpdateDTOs classDto)
        {
            var user = await _context.Users
               .SingleOrDefaultAsync(x => x.Email == email);
            if (user == null)
            {
                return null;
            }
            user = _mapper.Map<User>(classDto);
            user.ModifiedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return _mapper.Map<UserDisplayDTOs?>(user);
        }
    }
}
