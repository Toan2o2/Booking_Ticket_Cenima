export class Cinema {
  constructor(data = {}) {
    this.cinemaId = data.cinemaId || null;
    this.name = data.name || '';
    this.address = data.address || '';
    this.cityId = data.cityId || null;
    this.cityName = data.cityName || '';
    this.contactInfo = data.contactInfo || '';
    this.createdAt = data.createdAt || null;
    this.modifiedAt = data.modifiedAt || null;
    this.cinemaHallCount = data.cinemaHallCount || 0;
    this.cinemaHall = data.cinemaHall || [];
  }

  static fromApi(data) {
    return new Cinema({
      cinemaId: data.cinemaId || data.id,
      name: data.name,
      address: data.address,
      cityId: data.cityId,
      cityName: data.cityName,
      contactInfo: data.contactInfo,
      createdAt: data.createdAt,
      modifiedAt: data.modifiedAt,
      cinemaHallCount: data.cinemaHallCount,
      cinemaHall: data.cinemaHall || []
    });
  }

  toCreateDto() {
    return {
      name: this.name,
      address: this.address,
      cityId: this.cityId,
      contactInfo: this.contactInfo
    };
  }

  toUpdateDto() {
    return {
      name: this.name,
      address: this.address,
      cityId: this.cityId,
      contactInfo: this.contactInfo
    };
  }
} 