using System.ComponentModel.DataAnnotations;

namespace BookingTicketSysten.Models.DTOs.CinemaDTOs
{
    public class CinemaUpdateDto
    {
        [Required(ErrorMessage = "Cinema name is required.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Address is required.")]
        public string Address { get; set; }

        [Required(ErrorMessage = "Contact number is required.")]
        [RegularExpression(@"^0\d{9}$", ErrorMessage = "Contact number must have exactly 10 digits and start with 0.")]
        public string ContactInfo { get; set; }
    }
}
