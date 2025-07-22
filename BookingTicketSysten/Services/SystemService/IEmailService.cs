namespace BookingTicketSysten.Services.SystemService
{
    public interface IEmailService
    {
        Task SendOtpEmailAsync(string toEmail, string otp);

    }
}
