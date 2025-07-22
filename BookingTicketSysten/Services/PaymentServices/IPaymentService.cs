using BookingTicketSysten.Models.DTOs.PaymentDTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingTicketSysten.Services.PaymentServices
{
    public interface IPaymentService
    {
        Task<IEnumerable<PaymentDto>> GetAllPaymentsAsync();
        Task<PaymentDto> GetPaymentByIdAsync(int paymentId);
        Task<IEnumerable<PaymentDto>> GetPaymentsByUserIdAsync(int userId);
        Task<IEnumerable<PaymentDto>> GetPaymentsByBookingIdAsync(int bookingId);
        Task<PaymentDto> CreatePaymentAsync(PaymentCreateUpdateDto paymentDto);
        Task<PaymentDto> UpdatePaymentStatusAsync(int paymentId, PaymentStatusUpdateDto statusDto);
        Task<bool> DeletePaymentAsync(int paymentId);
        Task<PaymentDto> ProcessPaymentAsync(int bookingId, string paymentMethod);
        Task<bool> ValidatePaymentAsync(int paymentId, string transactionId);
    }
} 