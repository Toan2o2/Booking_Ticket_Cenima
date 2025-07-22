using System.ComponentModel.DataAnnotations;

namespace BookingTicketSysten.Models.DTOs.VoteDTOs
{
    public class VoteModerateDto
    {
        [Required]
        public bool IsApproved { get; set; }
        public string? FlagReason { get; set; }
    }
} 