using System;
using System.Collections.Generic;

namespace BookingTicketSysten.Models.DTOs.CityDTOs
{
    public class CityDto
    {
        public int CityId { get; set; }
        public string Name { get; set; }
        public int CinemaCount { get; set; }
        public List<CinemaInfoDto> Cinemas { get; set; } = new List<CinemaInfoDto>();
    }

    public class CinemaInfoDto
    {
        public int CinemaId { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string ContactInfo { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
    }
} 