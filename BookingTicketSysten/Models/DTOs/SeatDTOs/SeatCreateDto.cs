using System.ComponentModel.DataAnnotations;

namespace BookingTicketSysten.Models.DTOs.SeatDTOs
{
    public class SeatCreateDto
    {
        [Required(ErrorMessage = "Cinema ID is required.")]
        public int CinemaId { get; set; }

        [Required(ErrorMessage = "Hall ID is required.")]
        public int HallId { get; set; }

        [Required(ErrorMessage = "Row number is required.")]
        public string RowNumber { get; set; }

        [Range(1, 100, ErrorMessage = "Column number must be between 1 and 100.")]
        public int ColumnNumber { get; set; }

        [Required(ErrorMessage = "Seat type is required.")]
        public string SeatType { get; set; }
    }
}
