using System;

namespace BookingTicketSysten.Models.DTOs.MovieFavoriteDTOs
{
    public class MovieFavoriteDto
    {
        public int MovieFavoriteId { get; set; }
        public int UserId { get; set; }
        public int MovieId { get; set; }
        public DateTime? FavoriteTime { get; set; }
    }
} 