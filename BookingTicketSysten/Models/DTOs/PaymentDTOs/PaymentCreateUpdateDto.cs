using System.ComponentModel.DataAnnotations;

namespace BookingTicketSysten.Models.DTOs.PaymentDTOs
{
    public class PaymentCreateUpdateDto
    {
        [Required]
        public int BookingId { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }
        
        [Required]
        [StringLength(50)]
        public string PaymentMethod { get; set; }
        
        [StringLength(100)]
        public string TransactionId { get; set; }
    }
    
    public class PaymentStatusUpdateDto
    {
        [Required]
        [StringLength(50)]
        public string PaymentStatus { get; set; }
        
        [StringLength(100)]
        public string TransactionId { get; set; }
    }
} 