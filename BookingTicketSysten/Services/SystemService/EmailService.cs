using Microsoft.Extensions.Options;
using ProjectHouseWithLeaves.Helper.Email;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System.Security.Authentication;

namespace BookingTicketSysten.Services.SystemService
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private static readonly Random _random = new Random();
        public EmailService(IOptions<EmailSettings> emailSettingsOptions)
        {
            _emailSettings = emailSettingsOptions.Value;
        }
        public static string GenerateOtp(int length = 6)
        {
            const string chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ0123456789!@#$%^&*()";
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[_random.Next(s.Length)]).ToArray());
        }
        public async Task SendOtpEmailAsync(string toEmail, string otp)

        {
            Console.WriteLine($"Sending OTP '{otp}' to '{toEmail}'");

            // 1. Tạo đối tượng MimeMessage
            var emailMessage = new MimeMessage();

            // 2. Thiết lập Người gửi (From)
            emailMessage.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));

            // 3. Thiết lập Người nhận (To)
            emailMessage.To.Add(new MailboxAddress(string.Empty, toEmail)); // Tên người nhận có thể để trống

            // 4. Thiết lập Chủ đề (Subject)
            emailMessage.Subject = $"Mã OTP của bạn là: {otp}";

            // 5. Xây dựng Nội dung Email (Body) với BodyBuilder
            var bodyBuilder = new BodyBuilder();

            // 5a. Nội dung HTML (HtmlBody)
            bodyBuilder.HtmlBody = $@"
                <!DOCTYPE html>
                <html lang=""vi"">
                <head>
                    <meta charset=""UTF-8"">
                    <title>Xác nhận OTP</title>
                    <style>
                        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; }}
                        .email-container {{ max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                        .header {{ background-color: #007bff; color: #ffffff; padding: 10px 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px; }}
                        .header h1 {{ margin: 0; font-size: 24px; }}
                        .content {{ padding: 20px; text-align: left; line-height: 1.6; }}
                        .content p {{ margin-bottom: 15px; }}
                        .otp-code {{ font-size: 28px; font-weight: bold; color: #d9534f; text-align: center; margin: 20px 0; letter-spacing: 2px; }}
                        .footer {{ text-align: center; padding: 15px; font-size: 0.9em; color: #777; border-top: 1px solid #eeeeee; margin-top: 20px; }}
                    </style>
                </head>
                <body>
                    <div class=""email-container"">
                        <div class=""header""><h1>Xác Thực OTP</h1></div>
                        <div class=""content"">
                            <p>Chào bạn,</p>
                            <p>Mã OTP của bạn để hoàn tất thao tác là:</p>
                            <div class=""otp-code"">{otp}</div>
                            <p>Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                            <p>Nếu bạn không yêu cầu mã này, xin vui lòng bỏ qua email này.</p>
                        </div>
                        <div class=""footer"">
                            <p>Trân trọng,<br/>Đội ngũ {_emailSettings.SenderName ?? "Dịch vụ của chúng tôi"}</p>
                        </div>
                    </div>
                </body>
                </html>";

            // 5b. Nội dung Text thuần túy (TextBody) - cho các email client không hỗ trợ HTML
            bodyBuilder.TextBody = $@"
                Chào bạn,

                Mã OTP của bạn để hoàn tất thao tác là: {otp}

                Vui lòng không chia sẻ mã này với bất kỳ ai.

                Nếu bạn không yêu cầu mã này, xin vui lòng bỏ qua email này.

                Trân trọng,
                Đội ngũ {_emailSettings.SenderName ?? "Dịch vụ của chúng tôi"}
                ";

            // 6. Gán phần body đã xây dựng vào MimeMessage
            emailMessage.Body = bodyBuilder.ToMessageBody();

            // 7. Gửi Email sử dụng SmtpClient của MailKit
            try
            {
                using (var client = new SmtpClient())
                {

                    // Kết nối tới SMTP server của Gmail
                    // Port 587 sử dụng STARTTLS (nâng cấp kết nối lên bảo mật)
                    await client.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.SmtpPort, SecureSocketOptions.StartTls);

                    // Xác thực với thông tin đăng nhập (sử dụng Mật khẩu ứng dụng)
                    await client.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);

                    // Gửi email
                    await client.SendAsync(emailMessage);

                    // Ngắt kết nối
                    await client.DisconnectAsync(true);
                }
            }
            catch (SmtpCommandException ex)
            {
                throw new ApplicationException($"Lỗi SMTP command: {ex.Message} (StatusCode: {ex.StatusCode})", ex);
            }
            catch (System.Security.Authentication.AuthenticationException ex)
            {
                throw new ApplicationException("Lỗi xác thực SMTP. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu ứng dụng.", ex);
            }
            catch (Exception ex)
            {
                throw new ApplicationException($"Đã xảy ra lỗi không mong muốn khi gửi email: {ex.Message}", ex);
            }
        }
    }
}
