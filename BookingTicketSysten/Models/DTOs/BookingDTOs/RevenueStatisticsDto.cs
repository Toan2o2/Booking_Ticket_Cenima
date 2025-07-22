namespace BookingTicketSysten.Models.DTOs.BookingDTOs
{
    public class RevenueStatisticsDto
    {
        public decimal TotalRevenue { get; set; }
        public int TotalBookings { get; set; }
        public decimal AverageRevenue { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
} 