namespace BookingTicketSysten.Models.DTOs.ShowDTOS
{
    public class CreateShowDto
    {
        public int MovieId { get; set; }
        public int HallId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal TicketPrice { get; set; }
        public DateOnly? ShowDate { get; set; }
    }
}
