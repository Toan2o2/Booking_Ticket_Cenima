using System.ComponentModel.DataAnnotations;

namespace BookingTicketSysten.Models.DTOs.CinemaHallDTOs
{
    public class CinemaHallCreateDto
    {
        [Required(ErrorMessage = "CinemaId is required.")]
        public int CinemaId { get; set; }

        [Required(ErrorMessage = "Hall name is required.")]
        public string Name { get; set; }

        [Range(1, 200, ErrorMessage = "Total seats must be between 1 and 200.")]
        public int TotalSeats { get; set; }

    }
}
