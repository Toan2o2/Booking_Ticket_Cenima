namespace BookingTicketSysten.Models.DTOs.CinemaDTOs
{
    public class CinemaRevenueDto
    {
        public string CinemaName { get; set; }
        public string Address { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalBookings { get; set; }
    }
}
