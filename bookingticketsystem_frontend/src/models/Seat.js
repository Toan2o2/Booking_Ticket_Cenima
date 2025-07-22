export class Seat {
  constructor(data = {}) {
    this.seatId = data.seatId || null;
    this.hallId = data.hallId || null;
    this.rowNumber = data.rowNumber || '';
    this.columnNumber = data.columnNumber || 0;
    this.seatType = data.seatType || 'standard';
  }

  static fromApi(data) {
    return new Seat({
      seatId: data.seatId || data.id,
      hallId: data.hallId,
      rowNumber: data.rowNumber,
      columnNumber: data.columnNumber,
      seatType: data.seatType
    });
  }

  toCreateDto() {
    return {
      hallId: this.hallId,
      rowNumber: this.rowNumber,
      columnNumber: this.columnNumber,
      seatType: this.seatType
    };
  }

  toUpdateDto() {
    return {
      hallId: this.hallId,
      rowNumber: this.rowNumber,
      columnNumber: this.columnNumber,
      seatType: this.seatType
    };
  }
} 