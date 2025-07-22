export class Show {
  constructor(data = {}) {
    this.showId = data.showId || null;
    this.movieId = data.movieId || null;
    this.movieTitle = data.movieTitle || '';
    this.hallId = data.hallId || null;
    this.hallName = data.hallName || '';
    this.startTime = data.startTime || null;
    this.endTime = data.endTime || null;
    this.ticketPrice = data.ticketPrice || 0;
  }

  static fromApi(data) {
    return new Show({
      showId: data.showId || data.id,
      movieId: data.movieId,
      movieTitle: data.movieTitle,
      hallId: data.hallId || data.cinemaHallId,
      hallName: data.hallName || (data.cinemaHall ? data.cinemaHall.name : ''),
      startTime: data.startTime,
      endTime: data.endTime,
      ticketPrice: data.ticketPrice || data.price
    });
  }

  toCreateDto() {
    return {
      movieId: this.movieId,
      hallId: this.hallId,
      startTime: this.startTime,
      endTime: this.endTime,
      ticketPrice: this.ticketPrice
    };
  }

  toUpdateDto() {
    return {
      movieId: this.movieId,
      hallId: this.hallId,
      startTime: this.startTime,
      endTime: this.endTime,
      ticketPrice: this.ticketPrice
    };
  }
} 