using System;

namespace BookingTicketSysten.Models.DTOs
{
    public class PersonDto
    {
        public int PersonId { get; set; }
        public string Name { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string Biography { get; set; }
        public string Nationality { get; set; }
        public string PhotoUrl { get; set; }
        public string Role { get; set; } // actor/director/both/none
    }
} 