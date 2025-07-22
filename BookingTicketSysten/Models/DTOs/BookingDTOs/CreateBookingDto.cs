namespace BookingTicketSysten.Models.DTOs.BookingDTOs
{
    public class CreateBookingDto
    {
        public int UserId { get; set; }
        public int ShowId { get; set; }
        public List<int> SeatIds { get; set; }
        public string QrCodeData { get; set; }
    }
}
