using Microsoft.AspNetCore.Http;
using System;
using System.ComponentModel.DataAnnotations;

namespace BookingTicketSysten.Models.DTOs.PersonDTOs
{
    public class PersonCreateUpdateDto
    {
        [Required]
        public string Name { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string Biography { get; set; }
        [Required]
        public string Nationality { get; set; }
        public IFormFile? Photo { get; set; }
    }
}