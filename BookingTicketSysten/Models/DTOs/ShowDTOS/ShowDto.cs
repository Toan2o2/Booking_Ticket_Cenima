namespace BookingTicketSysten.Models.DTOs.ShowDTOS
{
    public class ShowDto
    {
        public int ShowId { get; set; }
        public int MovieId { get; set; }
        public string MovieTitle { get; set; }
        public int HallId { get; set; }
        public string HallName { get; set; }
        public string CinemaName { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal TicketPrice { get; set; }
        public DateOnly? ShowDate { get; set; }
    }
}
