export class CinemaHall {
  constructor(data = {}) {
    this.cinemaHallId = data.cinemaHallId || null;
    this.cinemaId = data.cinemaId || null;
    this.cinemaName = data.cinemaName || '';
    this.name = data.name || '';
    this.totalSeats = data.totalSeats || 0;
    this.createdAt = data.createdAt || null;
    this.modifiedAt = data.modifiedAt || null;
    this.seats = data.seats || [];
  }

  static fromApi(data) {
    return new CinemaHall({
      cinemaHallId: data.cinemaHallId || data.id,
      cinemaId: data.cinemaId,
      cinemaName: data.cinemaName,
      name: data.name,
      totalSeats: data.totalSeats,
      createdAt: data.createdAt,
      modifiedAt: data.modifiedAt,
      seats: data.seats || []
    });
  }

  toCreateDto() {
    return {
      cinemaId: this.cinemaId,
      name: this.name,
      totalSeats: this.totalSeats
    };
  }

  toUpdateDto() {
    return {
      cinemaId: this.cinemaId,
      name: this.name,
      totalSeats: this.totalSeats
    };
  }
} 