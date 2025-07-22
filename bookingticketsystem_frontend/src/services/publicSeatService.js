import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class PublicSeatService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}${API_ENDPOINTS.PUBLIC_SEATS}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getByHall(hallId) {
    try {
      const response = await this.api.get(`/by-hall/${hallId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBookedSeatsByShow(showId) {
    try {
      const response = await this.api.get(`/booked-by-show/${showId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSeatAvailability(showId) {
    try {
      const response = await this.api.get(`/availability/${showId}`);
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

export default new PublicSeatService(); 