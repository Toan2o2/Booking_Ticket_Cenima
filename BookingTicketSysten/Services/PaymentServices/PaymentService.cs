using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs.PaymentDTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BookingTicketSysten.Services.PaymentServices
{
    public class PaymentService : IPaymentService
    {
        private readonly MovieTicketBookingSystemContext _context;

        public PaymentService(MovieTicketBookingSystemContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PaymentDto>> GetAllPaymentsAsync()
        {
            var payments = await _context.Payments
                .Include(p => p.Booking)
                    .ThenInclude(b => b.User)
                .Include(p => p.Booking)
                    .ThenInclude(b => b.Show)
                        .ThenInclude(s => s.Movie)
                .Select(p => new PaymentDto
                {
                    PaymentId = p.PaymentId,
                    BookingId = p.BookingId,
                    Amount = p.Amount,
                    PaymentStatus = p.PaymentStatus,
                    PaymentMethod = p.PaymentMethod,
                    TransactionId = p.TransactionId,
                    CreatedAt = p.CreatedAt,
                    ModifiedAt = p.ModifiedAt,
                    UserId = p.Booking.UserId,
                    UserName = p.Booking.User.Name,
                    ShowId = p.Booking.ShowId,
                    MovieTitle = p.Booking.Show.Movie.Title,
                    ShowTime = p.Booking.Show.StartTime,
                    ShowDate = p.Booking.Show.ShowDate
                })
                .ToListAsync();

            return payments;
        }

        public async Task<PaymentDto> GetPaymentByIdAsync(int paymentId)
        {
            var payment = await _context.Payments
                .Include(p => p.Booking)
                    .ThenInclude(b => b.User)
                .Include(p => p.Booking)
                    .ThenInclude(b => b.Show)
                        .ThenInclude(s => s.Movie)
                .Where(p => p.PaymentId == paymentId)
                .Select(p => new PaymentDto
                {
                    PaymentId = p.PaymentId,
                    BookingId = p.BookingId,
                    Amount = p.Amount,
                    PaymentStatus = p.PaymentStatus,
                    PaymentMethod = p.PaymentMethod,
                    TransactionId = p.TransactionId,
                    CreatedAt = p.CreatedAt,
                    ModifiedAt = p.ModifiedAt,
                    UserId = p.Booking.UserId,
                    UserName = p.Booking.User.Name,
                    ShowId = p.Booking.ShowId,
                    MovieTitle = p.Booking.Show.Movie.Title,
                    ShowTime = p.Booking.Show.StartTime,
                    ShowDate = p.Booking.Show.ShowDate
                })
                .FirstOrDefaultAsync();

            return payment;
        }

        public async Task<IEnumerable<PaymentDto>> GetPaymentsByUserIdAsync(int userId)
        {
            var payments = await _context.Payments
                .Include(p => p.Booking)
                    .ThenInclude(b => b.User)
                .Include(p => p.Booking)
                    .ThenInclude(b => b.Show)
                        .ThenInclude(s => s.Movie)
                .Where(p => p.Booking.UserId == userId)
                .Select(p => new PaymentDto
                {
                    PaymentId = p.PaymentId,
                    BookingId = p.BookingId,
                    Amount = p.Amount,
                    PaymentStatus = p.PaymentStatus,
                    PaymentMethod = p.PaymentMethod,
                    TransactionId = p.TransactionId,
                    CreatedAt = p.CreatedAt,
                    ModifiedAt = p.ModifiedAt,
                    UserId = p.Booking.UserId,
                    UserName = p.Booking.User.Name,
                    ShowId = p.Booking.ShowId,
                    MovieTitle = p.Booking.Show.Movie.Title,
                    ShowTime = p.Booking.Show.StartTime,
                    ShowDate = p.Booking.Show.ShowDate
                })
                .ToListAsync();

            return payments;
        }

        public async Task<IEnumerable<PaymentDto>> GetPaymentsByBookingIdAsync(int bookingId)
        {
            var payments = await _context.Payments
                .Include(p => p.Booking)
                    .ThenInclude(b => b.User)
                .Include(p => p.Booking)
                    .ThenInclude(b => b.Show)
                        .ThenInclude(s => s.Movie)
                .Where(p => p.BookingId == bookingId)
                .Select(p => new PaymentDto
                {
                    PaymentId = p.PaymentId,
                    BookingId = p.BookingId,
                    Amount = p.Amount,
                    PaymentStatus = p.PaymentStatus,
                    PaymentMethod = p.PaymentMethod,
                    TransactionId = p.TransactionId,
                    CreatedAt = p.CreatedAt,
                    ModifiedAt = p.ModifiedAt,
                    UserId = p.Booking.UserId,
                    UserName = p.Booking.User.Name,
                    ShowId = p.Booking.ShowId,
                    MovieTitle = p.Booking.Show.Movie.Title,
                    ShowTime = p.Booking.Show.StartTime,
                    ShowDate = p.Booking.Show.ShowDate
                })
                .ToListAsync();

            return payments;
        }

        public async Task<PaymentDto> CreatePaymentAsync(PaymentCreateUpdateDto paymentDto)
        {
            // Check if booking exists and is not already paid
            var booking = await _context.Bookings
                .Include(b => b.Payment)
                .FirstOrDefaultAsync(b => b.BookingId == paymentDto.BookingId);

            if (booking == null)
                throw new ArgumentException("Booking not found");

            if (booking.Payment != null)
                throw new InvalidOperationException("Payment already exists for this booking");

            var payment = new Payment
            {
                BookingId = paymentDto.BookingId,
                Amount = paymentDto.Amount,
                PaymentStatus = "Pending",
                PaymentMethod = paymentDto.PaymentMethod,
                TransactionId = paymentDto.TransactionId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return await GetPaymentByIdAsync(payment.PaymentId);
        }

        public async Task<PaymentDto> UpdatePaymentStatusAsync(int paymentId, PaymentStatusUpdateDto statusDto)
        {
            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment == null)
                throw new ArgumentException("Payment not found");

            payment.PaymentStatus = statusDto.PaymentStatus;
            payment.TransactionId = statusDto.TransactionId ?? payment.TransactionId;
            payment.ModifiedAt = DateTime.UtcNow;

            // If payment is successful, update booking status
            if (statusDto.PaymentStatus == "Completed")
            {
                var booking = await _context.Bookings.FindAsync(payment.BookingId);
                if (booking != null)
                {
                    booking.Status = "Confirmed";
                    booking.ModifiedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            return await GetPaymentByIdAsync(paymentId);
        }

        public async Task<bool> DeletePaymentAsync(int paymentId)
        {
            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment == null)
                return false;

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PaymentDto> ProcessPaymentAsync(int bookingId, string paymentMethod)
        {
            var booking = await _context.Bookings
                .Include(b => b.Payment)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null)
                throw new ArgumentException("Booking not found");

            if (booking.Payment != null)
                throw new InvalidOperationException("Payment already exists for this booking");

            // Generate transaction ID
            var transactionId = GenerateTransactionId();

            var payment = new Payment
            {
                BookingId = bookingId,
                Amount = booking.TotalPrice,
                PaymentStatus = "Processing",
                PaymentMethod = paymentMethod,
                TransactionId = transactionId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // Simulate payment processing
            await SimulatePaymentProcessing(payment.PaymentId);

            return await GetPaymentByIdAsync(payment.PaymentId);
        }

        public async Task<bool> ValidatePaymentAsync(int paymentId, string transactionId)
        {
            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment == null)
                return false;

            return payment.TransactionId == transactionId && payment.PaymentStatus == "Completed";
        }

        private string GenerateTransactionId()
        {
            return $"TXN_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString("N").Substring(0, 8)}";
        }

        private async Task SimulatePaymentProcessing(int paymentId)
        {
            // Simulate payment processing delay
            await Task.Delay(2000);

            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment != null)
            {
                // Simulate successful payment (90% success rate)
                var random = new Random();
                if (random.Next(1, 11) <= 9)
                {
                    payment.PaymentStatus = "Completed";
                }
                else
                {
                    payment.PaymentStatus = "Failed";
                }
                payment.ModifiedAt = DateTime.UtcNow;

                // Update booking status if payment successful
                if (payment.PaymentStatus == "Completed")
                {
                    var booking = await _context.Bookings.FindAsync(payment.BookingId);
                    if (booking != null)
                    {
                        booking.Status = "Confirmed";
                        booking.ModifiedAt = DateTime.UtcNow;
                    }
                }

                await _context.SaveChangesAsync();
            }
        }
    }
} 