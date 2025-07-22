import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class PaymentService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}${API_ENDPOINTS.PAYMENTS}`,
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

  async getById(paymentId) {
    try {
      const response = await this.api.get(`/${paymentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getByUserId(userId) {
    try {
      const response = await this.api.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getByBookingId(bookingId) {
    try {
      const response = await this.api.get(`/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(paymentData) {
    try {
      const response = await this.api.post('/', paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateStatus(paymentId, statusData) {
    try {
      const response = await this.api.put(`/${paymentId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(paymentId) {
    try {
      await this.api.delete(`/${paymentId}`);
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async processPayment(bookingId, paymentMethod) {
    try {
      const response = await this.api.post(`/process/${bookingId}`, { paymentMethod });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validatePayment(paymentId, transactionId) {
    try {
      const response = await this.api.post('/validate', { paymentId, transactionId });
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

export default new PaymentService(); 