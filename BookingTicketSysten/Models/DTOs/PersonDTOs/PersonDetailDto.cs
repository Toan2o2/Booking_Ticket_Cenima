using System;
using System.Collections.Generic;

namespace BookingTicketSysten.Models.DTOs.PersonDTOs
{
    public class PersonMovieRoleDto
    {
        public int MovieId { get; set; }
        public string MovieTitle { get; set; }
        public string RoleName { get; set; } // Chỉ cho diễn viên, đạo diễn thì để "Đạo diễn"
    }

    public class PersonDetailDto
    {
        public int PersonId { get; set; }
        public string Name { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string Biography { get; set; }
        public string Nationality { get; set; }
        public string PhotoUrl { get; set; }
        public string Role { get; set; } // actor/director/both
        public List<PersonMovieRoleDto> MoviesAsActor { get; set; }
        public List<PersonMovieRoleDto> MoviesAsDirector { get; set; }
    }
} 