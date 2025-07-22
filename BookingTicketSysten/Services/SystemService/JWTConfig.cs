using BookingTicketSysten.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BookingTicketSysten.Services.SystemService
{
    public class JWTConfig
    {
        private readonly IConfiguration _configuration;

        public JWTConfig(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user)
        {
            string role = user.Role.RoleName;
            var jwtTokenHandler = new JwtSecurityTokenHandler();
            //lay chu ky
            var serectKeyBytes = Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]);
            //data o description
            var tokenDescription = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]{
                   new Claim(       ClaimTypes.NameIdentifier, user.UserId.ToString()),
                                        new Claim(ClaimTypes.Name, user.Email),                      
                                        new Claim(JwtRegisteredClaimNames.Email, user.Email),        
                                        new Claim("Name", user.Name ?? ""),                   
                                        new Claim("phone", user.Phone ?? ""),
                                        new Claim("role", role)       
                    
                    //roles
                }),
                Expires = DateTime.UtcNow.AddMonths(3),
                Audience = _configuration["JWT:ValidAudience"],
                Issuer = _configuration["JWT:ValidIssuer"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey
                (serectKeyBytes), SecurityAlgorithms.HmacSha256Signature)
            };
            //create token
            var token = jwtTokenHandler.CreateToken(tokenDescription);
            var accessToken = jwtTokenHandler.WriteToken(token);
            return accessToken;
        }

        
    }
}
