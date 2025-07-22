using System.ComponentModel.DataAnnotations;

namespace BookingTicketSysten.Models.DTOs.CityDTOs
{
    public class CityCreateUpdateDto
    {
        [Required]
        [StringLength(255, ErrorMessage = "City name cannot exceed 255 characters")]
        public string Name { get; set; }
    }
} 