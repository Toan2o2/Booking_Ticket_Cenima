using System.ComponentModel.DataAnnotations;

namespace BookingTicketSysten.Models.DTOs.CommentDTOs
{
    public class CommentUpdateDto
    {
        [Required]
        public string CommentText { get; set; }
    }
} 