namespace BookingTicketSysten.Models.DTOs.CinemaHallDTOs
{
    public class CinemaHallDto
    {
        public int CinemaHallId { get; set; }
        public int CinemaId { get; set; }
        public string CinemaName { get; set; }

        public string Name { get; set; }

        public int TotalSeats { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? ModifiedAt { get; set; }

        public List<SeatDto> Seats { get; set; } = new List<SeatDto>();
    }

    public class SeatDto
    {
        public int SeatId { get; set; }

        public string RowNumber { get; set; }

        public int ColumnNumber { get; set; }

        public string SeatType { get; set; }
    }
}
