namespace BookingTicketSysten.Models.DTOs.SeatDTOs
{
    public class SeatDto
    {
        public int SeatId { get; set; }
        public int HallId { get; set; }

        public string RowNumber { get; set; }

        public int ColumnNumber { get; set; }

        public string SeatType { get; set; }
    }
}
