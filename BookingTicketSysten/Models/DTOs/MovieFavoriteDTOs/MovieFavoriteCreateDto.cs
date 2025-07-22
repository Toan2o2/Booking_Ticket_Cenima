using System.ComponentModel.DataAnnotations;

namespace BookingTicketSysten.Models.DTOs.MovieFavoriteDTOs
{
    public class MovieFavoriteCreateDto
    {
        [Required]
        public int UserId { get; set; }
        [Required]
        public int MovieId { get; set; }
    }
} 