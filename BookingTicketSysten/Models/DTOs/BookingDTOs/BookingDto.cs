namespace BookingTicketSysten.Models.DTOs.BookingDTOs
{
    public class BookingDto
    {
        public int BookingId { get; set; }
        public string UserName { get; set; }
        public string MovieTitle { get; set; }
        public DateTime ShowStartTime { get; set; }
        public DateOnly? ShowDate { get; set; }
        public int NumberOfSeats { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; }
        public List<SeatInfoDto> Seats { get; set; }
        public string HallName { get; set; } // Thêm tên phòng
        public string CinemaName { get; set; } // Thêm tên rạp
        public string CinemaAddress { get; set; } // Thêm địa chỉ rạp
    }
}
