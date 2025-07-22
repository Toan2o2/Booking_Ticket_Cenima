using System;
using System.Collections.Generic;

namespace BookingTicketSysten.Models.DTOs
{
    public class MovieDto
    {
        public int MovieId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Duration { get; set; }
        public string Language { get; set; }
        public DateOnly? ReleaseDate { get; set; }
        public string TrailerUrl { get; set; }
        public string PosterUrl { get; set; }
        public decimal? Rating { get; set; }
        public List<GenreDto> Genres { get; set; }
        public List<PersonDto> Actors { get; set; }
        public List<PersonDto> Directors { get; set; }
    }
} 