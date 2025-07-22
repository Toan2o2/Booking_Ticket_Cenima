using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BookingTicketSysten.Models.DTOs
{
    public class MovieCreateUpdateDto
    {
        [Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        [Range(1, int.MaxValue)]
        public int Duration { get; set; }
        [Required]
        public string Language { get; set; }
        public DateOnly? ReleaseDate { get; set; }
        public string? TrailerUrl { get; set; }
        public decimal? Rating { get; set; }
        public IFormFile? Poster { get; set; }
        public List<int> GenreIds { get; set; }
        public List<int> ActorIds { get; set; }
        public List<int> DirectorIds { get; set; }
    }
} 