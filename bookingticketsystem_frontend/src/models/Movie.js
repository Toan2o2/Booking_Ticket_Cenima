export class Movie {
  constructor(data = {}) {
    this.movieId = data.movieId || null;
    this.title = data.title || '';
    this.description = data.description || '';
    this.duration = data.duration || 0;
    this.language = data.language || '';
    this.releaseDate = data.releaseDate || null;
    this.trailerUrl = data.trailerUrl || '';
    this.posterUrl = data.posterUrl || '';
    this.rating = data.rating || 0;
    this.Genres = data.Genres || [];
    this.Actors = data.Actors || [];
    this.Directors = data.Directors || [];
  }

  static fromApi(data) {
    return new Movie({
      movieId: data.movieId || data.id,
      title: data.title,
      description: data.description,
      duration: data.duration,
      language: data.language,
      releaseDate: data.releaseDate,
      trailerUrl: data.trailerUrl,
      posterUrl: data.posterUrl,
      rating: data.rating,
      Genres: data.genres || [],
      Actors: data.actors || [],
      Directors: data.directors || []
    });
  }

  toCreateUpdateDto() {
    return {
      Title: this.title,
      Description: this.description,
      Duration: this.duration,
      Language: this.language,
      ReleaseDate: this.releaseDate ? (typeof this.releaseDate === 'string' ? this.releaseDate : this.releaseDate.toISOString().split('T')[0]) : '',
      TrailerUrl: this.trailerUrl,
      PosterUrl: this.posterUrl,
      Rating: this.rating,
      GenreIds: this.Genres.map(g => g.genreId).filter(id => id !== null && id !== undefined),
      ActorIds: this.Actors.map(a => a.personId).filter(id => id !== null && id !== undefined),
      DirectorIds: this.Directors.map(d => d.personId).filter(id => id !== null && id !== undefined)
    };
  }
} 