namespace BookingTicketSysten.Models.DTOs.UserDTOs
{
    public class UserDisplayDTOs()
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public decimal? LoyaltyPoints { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public bool? IsActive { get; set; }
    }
    public class UserCreateDTOs()
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        public string? Phone { get; set; }
    }
    public class UserUpdateDTOs()
    {
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? PasswordHash { get; set; }
    }
    public class UpdatePasswordDTO
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? ConfirmPassword { get; set; }
    }
    public class ChangePasswordDtos
    {
        public string? Email { get; set; }
        public string? OldPassword { get; set; }
        public string? Password { get; set; }
        public string? ConfirmPassword { get; set; }
    }
    public class UserLogin
    {
        public string? Email {  set; get; }
        public string? PasswordHash {  set; get; }
    }
}
