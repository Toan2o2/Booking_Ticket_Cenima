namespace BookingTicketSysten.Models.DTOs.BookingDTOs
{
    public class SeatInfoDto
    {
        public int SeatId { get; set; }
        public string RowNumber { get; set; }
        public int ColumnNumber { get; set; }
        public string SeatType { get; set; }
    }
}
