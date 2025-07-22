using System.ComponentModel.DataAnnotations;

namespace BookingTicketSysten.Models.DTOs.CommentDTOs
{
    public class CommentCreateDto
    {
        [Required]
        public int UserId { get; set; }
        [Required]
        public int MovieId { get; set; }
        [Required]
        [StringLength(1000, MinimumLength = 1, ErrorMessage = "Comment text must be between 1 and 1000 characters")]
        public string CommentText { get; set; }
        [Range(1, int.MaxValue, ErrorMessage = "Parent comment ID must be a positive integer")]
        public int? ParentCommentId { get; set; }
    }
} 