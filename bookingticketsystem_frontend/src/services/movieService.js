import axios from 'axios';
import { Movie } from '../models/Movie';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class MovieService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}${API_ENDPOINTS.MOVIES}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAll() {
    try {
      const response = await this.api.get('/');
      return response.data.map(movie => Movie.fromApi(movie));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getById(id) {
    try {
      const response = await this.api.get(`/${id}`);
      return Movie.fromApi(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  buildFormData(dto, posterFile) {
    const formData = new FormData();
    // Append từng trường, đúng PascalCase
    if (dto.Title) formData.append('Title', dto.Title);
    if (dto.Description) formData.append('Description', dto.Description);
    if (dto.Duration) formData.append('Duration', dto.Duration);
    if (dto.Language) formData.append('Language', dto.Language);
    if (dto.ReleaseDate) formData.append('ReleaseDate', dto.ReleaseDate);
    if (dto.TrailerUrl) formData.append('TrailerUrl', dto.TrailerUrl);
    if (dto.Rating !== undefined && dto.Rating !== null) formData.append('Rating', dto.Rating);
    if (Array.isArray(dto.GenreIds)) dto.GenreIds.forEach(id => formData.append('GenreIds', id));
    if (Array.isArray(dto.ActorIds)) dto.ActorIds.forEach(id => formData.append('ActorIds', id));
    if (Array.isArray(dto.DirectorIds)) dto.DirectorIds.forEach(id => formData.append('DirectorIds', id));
    if (posterFile) formData.append('Poster', posterFile);
    return formData;
  }

  async create(movieData, posterFile = null) {
    try {
      const dto = movieData.toCreateUpdateDto();
      const formData = this.buildFormData(dto, posterFile);
      const response = await this.api.post('/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return Movie.fromApi(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(id, movieData, posterFile = null) {
    try {
      const dto = movieData.toCreateUpdateDto();
      const formData = this.buildFormData(dto, posterFile);
      const response = await this.api.put(`/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return Movie.fromApi(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(id) {
    try {
      await this.api.delete(`/${id}`);
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getByGenre(genreId) {
    try {
      const response = await this.api.get(`/by-genre/${genreId}`);
      return response.data.map(movie => Movie.fromApi(movie));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getByPerson(personId) {
    try {
      const response = await this.api.get(`/by-person/${personId}`);
      return response.data.map(movie => Movie.fromApi(movie));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      return new Error(error.response.data.message || 'Có lỗi xảy ra');
    }
    return new Error('Không thể kết nối đến server');
  }
}

export default new MovieService(); 