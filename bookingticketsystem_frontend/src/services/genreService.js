import axios from 'axios';
import { Genre } from '../models/Genre';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class GenreService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}${API_ENDPOINTS.GENRES}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  buildDto(genreData) {
    const dto = genreData.toCreateUpdateDto();
    return { Name: dto.Name };
  }

  async getAll() {
    try {
      const response = await this.api.get('/');
      return response.data.map(genre => Genre.fromApi(genre));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getById(id) {
    try {
      const response = await this.api.get(`/${id}`);
      return Genre.fromApi(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(genreData) {
    try {
      const dto = this.buildDto(genreData);
      const response = await this.api.post('/', dto);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(id, genreData) {
    try {
      const dto = this.buildDto(genreData);
      const response = await this.api.put(`/${id}`, dto);
      return response.data;
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

  handleError(error) {
    if (error.response) {
      return new Error(error.response.data.message || 'Có lỗi xảy ra');
    }
    return new Error('Không thể kết nối đến server');
  }
}

export default new GenreService(); 