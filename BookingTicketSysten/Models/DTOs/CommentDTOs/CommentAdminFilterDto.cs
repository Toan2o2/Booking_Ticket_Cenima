using System;

namespace BookingTicketSysten.Models.DTOs.CommentDTOs
{
    public class CommentAdminFilterDto
    {
        public int? UserId { get; set; }
        public int? MovieId { get; set; }
        public bool? IsApproved { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string Sort { get; set; } = "newest";
    }
} 