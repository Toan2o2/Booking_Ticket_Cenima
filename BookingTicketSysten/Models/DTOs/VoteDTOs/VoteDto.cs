using System;

namespace BookingTicketSysten.Models.DTOs.VoteDTOs
{
    public class VoteDto
    {
        public int VoteId { get; set; }
        public int MovieId { get; set; }
        public int UserId { get; set; }
        public int RatingValue { get; set; }
        public DateTime? VoteTime { get; set; }
    }
} 