using System.ComponentModel.DataAnnotations;

namespace BookingTicketSysten.Models.DTOs.CinemaHallDTOs
{
    public class CinemaHallUpdateDto
    {
        [Required(ErrorMessage = "Hall name is required.")]
        public string Name { get; set; }

        [Range(1, 500, ErrorMessage = "Total seats must be between 1 and 500.")]
        public int TotalSeats { get; set; }
    }
}
