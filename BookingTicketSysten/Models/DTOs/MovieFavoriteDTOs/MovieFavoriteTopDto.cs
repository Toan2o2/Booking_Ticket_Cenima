using System;

namespace BookingTicketSysten.Models.DTOs.MovieFavoriteDTOs
{
    public class MovieFavoriteTopDto
    {
        public int MovieId { get; set; }
        public string MovieTitle { get; set; }
        public int FavoriteCount { get; set; }
    }
} 