import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class BookingService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}${API_ENDPOINTS.BOOKINGS}`,
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

  async create(bookingData) {
    try {
      const response = await this.api.post('/', bookingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancel(id) {
    try {
      const response = await this.api.put(`/cancel/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getByUser(userId) {
    try {
      const response = await this.api.get(`/user/${userId}`);
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

export default new BookingService(); 