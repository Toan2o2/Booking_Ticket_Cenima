using System.ComponentModel.DataAnnotations;

namespace BookingTicketSysten.Models.DTOs.VoteDTOs
{
    public class VoteCreateUpdateDto
    {
        [Required]
        public int MovieId { get; set; }
        [Required]
        public int UserId { get; set; }
        [Range(1, 5)]
        public int RatingValue { get; set; }
    }
} 