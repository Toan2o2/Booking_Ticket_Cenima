using BookingTicketSysten.Models.DTOs.CityDTOs;

namespace BookingTicketSysten.Models.DTOs.CinemaDTOs
{
    public class CinemaDto
    {
        public int CinemaId { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public int CityId { get; set; }
        public string CityName { get; set; }

        public string ContactInfo { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? ModifiedAt { get; set; }
        public int CinemaHallCount { get; set; }
        public List<CinemaHallDto> CinemaHall { get; set; } = new List<CinemaHallDto>();

    }
    public class CinemaHallDto
    {
        public int HallId { get; set; }

        public string Name { get; set; }

        public int TotalSeats { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? ModifiedAt { get; set; }
    }
}
