export const API_BASE_URL = import.meta.env.VITE_BASE_URL_API || 'https://localhost:7262/api';

export const API_ENDPOINTS = {
  MOVIES: '/Movie',
  GENRES: '/Genre',
  PERSONS: '/Person',
  CITIES: '/City',
  AUTH: '/Authentication',
  USERS: '/User',
  SHOWS: '/Show',
  VOTES: '/Vote',
  BOOKINGS: '/Booking',
  CINEMAS: '/admin/Cinema',
  CINEMA_HALLS: '/admin/CinemaHall',
  PAYMENTS: '/Payment',
  COMMENTS: '/Comment',
  MOVIE_FAVORITES: '/MovieFavorite',
  SEATS: '/admin/Seat',
  PUBLIC_SEATS: '/PublicSeat'
}; 