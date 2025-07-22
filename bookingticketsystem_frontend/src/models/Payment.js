export class Payment {
  constructor(data = {}) {
    this.paymentId = data.paymentId || null;
    this.bookingId = data.bookingId || null;
    this.amount = data.amount || 0;
    this.paymentStatus = data.paymentStatus || '';
    this.paymentMethod = data.paymentMethod || '';
    this.transactionId = data.transactionId || '';
    this.createdAt = data.createdAt || null;
    this.modifiedAt = data.modifiedAt || null;
    this.userId = data.userId || null;
    this.userName = data.userName || '';
    this.showId = data.showId || null;
    this.movieTitle = data.movieTitle || '';
    this.showTime = data.showTime || null;
  }

  static fromApi(data) {
    return new Payment({
      paymentId: data.paymentId || data.id,
      bookingId: data.bookingId,
      amount: data.amount,
      paymentStatus: data.paymentStatus || data.status,
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      createdAt: data.createdAt || data.paymentDate,
      modifiedAt: data.modifiedAt || data.updatedAt,
      userId: data.userId,
      userName: data.userName,
      showId: data.showId,
      movieTitle: data.movieTitle,
      showTime: data.showTime
    });
  }

  toCreateDto() {
    return {
      bookingId: this.bookingId,
      amount: this.amount,
      paymentStatus: this.paymentStatus,
      paymentMethod: this.paymentMethod,
      transactionId: this.transactionId,
      createdAt: this.createdAt
    };
  }

  toUpdateDto() {
    return {
      bookingId: this.bookingId,
      amount: this.amount,
      paymentStatus: this.paymentStatus,
      paymentMethod: this.paymentMethod,
      transactionId: this.transactionId,
      createdAt: this.createdAt
    };
  }
} 