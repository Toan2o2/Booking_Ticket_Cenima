using System;

namespace BookingTicketSysten.Models.DTOs.PaymentDTOs
{
    public class PaymentDto
    {
        public int PaymentId { get; set; }
        public int BookingId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentStatus { get; set; }
        public string PaymentMethod { get; set; }
        public string TransactionId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
        
        // Additional booking information
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int ShowId { get; set; }
        public string MovieTitle { get; set; }
        public DateTime ShowTime { get; set; }
        public DateOnly? ShowDate { get; set; }
    }
} 