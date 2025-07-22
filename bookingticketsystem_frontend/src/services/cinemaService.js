import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class CinemaService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}${API_ENDPOINTS.CINEMAS}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAll() {
    try {
      const response = await this.api.get('/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getById(id) {
    try {
      const response = await this.api.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(cinemaData) {
    try {
      const response = await this.api.post('/', cinemaData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(id, cinemaData) {
    try {
      const response = await this.api.put(`/${id}`, cinemaData);
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

  async searchByName(name) {
    try {
      const response = await this.api.get(`/search?name=${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      return new Error(error.response.data.message || error.response.data.error || 'Có lỗi xảy ra');
    }
    return new Error('Không thể kết nối đến server');
  }
}

export default new CinemaService(); 