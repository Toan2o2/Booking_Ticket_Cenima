using System.Collections.Generic;

namespace BookingTicketSysten.Models.DTOs.VoteDTOs
{
    public class VoteStatsDto
    {
        public int MovieId { get; set; }
        public int TotalVotes { get; set; }
        public double AverageRating { get; set; }
        public Dictionary<int, int> StarCounts { get; set; } = new(); // key: star (1-5), value: count
    }
} 