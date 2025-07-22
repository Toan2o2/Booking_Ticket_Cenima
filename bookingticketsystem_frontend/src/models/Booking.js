export class Booking {
  constructor(data = {}) {
    this.bookingId = data.bookingId || null;
    this.userName = data.userName || '';
    this.movieTitle = data.movieTitle || '';
    this.showStartTime = data.showStartTime || null;
    this.numberOfSeats = data.numberOfSeats || 0;
    this.totalPrice = data.totalPrice || 0;
    this.status = data.status || '';
    this.seats = data.seats || [];
  }

  static fromApi(data) {
    return new Booking({
      bookingId: data.bookingId || data.id,
      userName: data.userName,
      movieTitle: data.movieTitle,
      showStartTime: data.showStartTime,
      numberOfSeats: data.numberOfSeats,
      totalPrice: data.totalPrice,
      status: data.status,
      seats: data.seats || []
    });
  }

  toCreateDto() {
    return {
      userName: this.userName,
      movieTitle: this.movieTitle,
      showStartTime: this.showStartTime,
      numberOfSeats: this.numberOfSeats,
      totalPrice: this.totalPrice,
      status: this.status,
      seatIds: this.seats.map(seat => seat.seatId)
    };
  }

  toUpdateDto() {
    return {
      userName: this.userName,
      movieTitle: this.movieTitle,
      showStartTime: this.showStartTime,
      numberOfSeats: this.numberOfSeats,
      totalPrice: this.totalPrice,
      status: this.status
    };
  }
} 