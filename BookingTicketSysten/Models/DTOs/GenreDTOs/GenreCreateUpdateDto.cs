using System.ComponentModel.DataAnnotations;

namespace BookingTicketSysten.Models.DTOs
{
    public class GenreCreateUpdateDto
    {
        [Required]
        public string Name { get; set; }
    }
} 