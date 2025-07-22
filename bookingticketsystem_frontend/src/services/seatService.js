import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class SeatService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}${API_ENDPOINTS.SEATS}`,
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

  async create(seatData) {
    try {
      const response = await this.api.post('/', seatData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(seatId, seatData) {
    try {
      const response = await this.api.put(`/seats/${seatId}`, seatData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(seatId) {
    try {
      const response = await this.api.delete(`/seats/${seatId}`);
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

export default new SeatService(); 