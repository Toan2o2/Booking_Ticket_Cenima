using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace BookingTicketSysten.Middleware
{
    public class PaymentLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<PaymentLoggingMiddleware> _logger;

        public PaymentLoggingMiddleware(RequestDelegate next, ILogger<PaymentLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Check if this is a payment-related request
            if (IsPaymentRequest(context.Request.Path))
            {
                var originalBodyStream = context.Response.Body;

                try
                {
                    // Log the incoming request
                    await LogPaymentRequest(context);

                    // Capture the response
                    using var memoryStream = new MemoryStream();
                    context.Response.Body = memoryStream;

                    await _next(context);

                    // Log the response
                    await LogPaymentResponse(context, memoryStream);

                    // Copy the response back to the original stream
                    memoryStream.Position = 0;
                    await memoryStream.CopyToAsync(originalBodyStream);
                }
                finally
                {
                    context.Response.Body = originalBodyStream;
                }
            }
            else
            {
                await _next(context);
            }
        }

        private bool IsPaymentRequest(PathString path)
        {
            return path.StartsWithSegments("/api/payment", StringComparison.OrdinalIgnoreCase);
        }

        private async Task LogPaymentRequest(HttpContext context)
        {
            var requestInfo = new
            {
                Timestamp = DateTime.UtcNow,
                Method = context.Request.Method,
                Path = context.Request.Path,
                QueryString = context.Request.QueryString.ToString(),
                UserAgent = context.Request.Headers["User-Agent"].ToString(),
                IPAddress = GetClientIPAddress(context)
            };

            _logger.LogInformation("Payment Request: {@RequestInfo}", requestInfo);

            // Log request body for POST/PUT requests
            if (context.Request.Method == "POST" || context.Request.Method == "PUT")
            {
                context.Request.EnableBuffering();
                var body = await GetRequestBody(context.Request);
                _logger.LogInformation("Payment Request Body: {Body}", body);
                context.Request.Body.Position = 0;
            }
        }

        private async Task LogPaymentResponse(HttpContext context, MemoryStream responseStream)
        {
            var responseInfo = new
            {
                Timestamp = DateTime.UtcNow,
                StatusCode = context.Response.StatusCode,
                ContentType = context.Response.ContentType
            };

            _logger.LogInformation("Payment Response: {@ResponseInfo}", responseInfo);

            // Log response body for successful responses
            if (context.Response.StatusCode >= 200 && context.Response.StatusCode < 300)
            {
                responseStream.Position = 0;
                var responseBody = await new StreamReader(responseStream).ReadToEndAsync();
                _logger.LogInformation("Payment Response Body: {Body}", responseBody);
            }
        }

        private async Task<string> GetRequestBody(HttpRequest request)
        {
            request.Body.Position = 0;
            using var reader = new StreamReader(request.Body, Encoding.UTF8, leaveOpen: true);
            return await reader.ReadToEndAsync();
        }

        private string GetClientIPAddress(HttpContext context)
        {
            return context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }
    }

    // Extension method for easy middleware registration
    public static class PaymentLoggingMiddlewareExtensions
    {
        public static IApplicationBuilder UsePaymentLogging(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<PaymentLoggingMiddleware>();
        }
    }
} 