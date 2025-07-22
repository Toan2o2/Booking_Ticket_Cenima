using System;
using System.Collections.Generic;

namespace BookingTicketSysten.Models.DTOs.CommentDTOs
{
    public class CommentDto
    {
        public int CommentId { get; set; }
        public int UserId { get; set; }
        public int MovieId { get; set; }
        public string CommentText { get; set; }
        public int? ParentCommentId { get; set; }
        public bool? IsApproved { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public string UserName { get; set; }
        public List<CommentDto> Replies { get; set; } = new();
    }
} 