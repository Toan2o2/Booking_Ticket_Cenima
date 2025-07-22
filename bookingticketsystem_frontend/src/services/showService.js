import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class ShowService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}${API_ENDPOINTS.SHOWS}`,
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

  async getByMovie(movieId) {
    try {
      const response = await this.api.get(`/by-movie/${movieId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getByDate(date) {
    try {
      const response = await this.api.get(`/by-date/${date}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(showData) {
    try {
      const response = await this.api.post('/', showData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(id, showData) {
    try {
      const response = await this.api.put(`/${id}`, showData);
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
      return new Error(error.response.data.message || error.response.data.error || 'Có lỗi xảy ra');
    }
    return new Error('Không thể kết nối đến server');
  }
}

export default new ShowService(); 