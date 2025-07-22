export class City {
  constructor(data = {}) {
    this.cityId = data.cityId || null;
    this.name = data.name || '';
    this.cinemaCount = data.cinemaCount || 0;
    this.Cinemas = data.Cinemas || [];
  }

  static fromApi(data) {
    return new City({
      cityId: data.cityId || data.id,
      name: data.name,
      cinemaCount: data.cinemaCount,
      Cinemas: data.cinemas || []
    });
  }

  toCreateUpdateDto() {
    return {
      Name: this.name
    };
  }
} 