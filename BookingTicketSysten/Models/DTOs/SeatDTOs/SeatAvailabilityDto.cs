namespace BookingTicketSysten.Models.DTOs.SeatDTOs
{
    public class SeatAvailabilityDto
    {
        public int ShowId { get; set; }
        public int HallId { get; set; }
        public string HallName { get; set; }
        public List<SeatDto> AllSeats { get; set; } = new List<SeatDto>();
        public List<int> BookedSeatIds { get; set; } = new List<int>();
        public List<SeatDto> AvailableSeats { get; set; } = new List<SeatDto>();
        public int TotalSeats { get; set; }
        public int BookedSeats { get; set; }
        public int AvailableSeatsCount { get; set; }
    }
} 