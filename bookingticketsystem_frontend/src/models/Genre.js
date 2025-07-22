export class Genre {
  constructor(data = {}) {
    this.genreId = data.genreId || null;
    this.name = data.name || '';
  }

  static fromApi(data) {
    return new Genre({
      genreId: data.genreId || data.id,
      name: data.name
    });
  }

  toCreateUpdateDto() {
    return {
      Name: this.name
    };
  }
} 