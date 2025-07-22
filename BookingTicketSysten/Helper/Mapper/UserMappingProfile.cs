using AutoMapper;
using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs.UserDTOs;

namespace BookingTicketSysten.Helper.Mapper
{
    public class UserMappingProfile : Profile
    {
        public UserMappingProfile()
        {
            CreateMap<UserCreateDTOs, User>();
            CreateMap<UserUpdateDTOs, User>();
            CreateMap<User, UserUpdateDTOs>();
            CreateMap<User, UserDisplayDTOs>();
        }
    }
}
