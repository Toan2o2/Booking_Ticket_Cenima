using BookingTicketSysten.Models.DTOs.PaymentDTOs;
using BookingTicketSysten.Services.PaymentServices;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingTicketSysten.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        /// <summary>
        /// Get all payments
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetAllPayments()
        {
            try
            {
                var payments = await _paymentService.GetAllPaymentsAsync();
                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Get payment by ID
        /// </summary>
        [HttpGet("{paymentId}")]
        public async Task<ActionResult<PaymentDto>> GetPaymentById(int paymentId)
        {
            try
            {
                var payment = await _paymentService.GetPaymentByIdAsync(paymentId);
                if (payment == null)
                    return NotFound(new { message = "Payment not found" });

                return Ok(payment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Get payments by user ID
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetPaymentsByUserId(int userId)
        {
            try
            {
                var payments = await _paymentService.GetPaymentsByUserIdAsync(userId);
                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Get payments by booking ID
        /// </summary>
        [HttpGet("booking/{bookingId}")]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetPaymentsByBookingId(int bookingId)
        {
            try
            {
                var payments = await _paymentService.GetPaymentsByBookingIdAsync(bookingId);
                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Create a new payment
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<PaymentDto>> CreatePayment([FromBody] PaymentCreateUpdateDto paymentDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var payment = await _paymentService.CreatePaymentAsync(paymentDto);
                return CreatedAtAction(nameof(GetPaymentById), new { paymentId = payment.PaymentId }, payment);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Update payment status
        /// </summary>
        [HttpPut("{paymentId}/status")]
        public async Task<ActionResult<PaymentDto>> UpdatePaymentStatus(int paymentId, [FromBody] PaymentStatusUpdateDto statusDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var payment = await _paymentService.UpdatePaymentStatusAsync(paymentId, statusDto);
                return Ok(payment);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete payment
        /// </summary>
        [HttpDelete("{paymentId}")]
        public async Task<ActionResult> DeletePayment(int paymentId)
        {
            try
            {
                var result = await _paymentService.DeletePaymentAsync(paymentId);
                if (!result)
                    return NotFound(new { message = "Payment not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Process payment for a booking
        /// </summary>
        [HttpPost("process/{bookingId}")]
        public async Task<ActionResult<PaymentDto>> ProcessPayment(int bookingId, [FromBody] PaymentProcessRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.PaymentMethod))
                    return BadRequest(new { message = "Payment method is required" });

                var payment = await _paymentService.ProcessPaymentAsync(bookingId, request.PaymentMethod);
                return Ok(payment);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Validate payment
        /// </summary>
        [HttpPost("validate")]
        public async Task<ActionResult> ValidatePayment([FromBody] PaymentValidationRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.TransactionId))
                    return BadRequest(new { message = "Transaction ID is required" });

                var isValid = await _paymentService.ValidatePaymentAsync(request.PaymentId, request.TransactionId);
                return Ok(new { isValid });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }

    public class PaymentProcessRequest
    {
        public string PaymentMethod { get; set; }
    }

    public class PaymentValidationRequest
    {
        public int PaymentId { get; set; }
        public string TransactionId { get; set; }
    }
} 