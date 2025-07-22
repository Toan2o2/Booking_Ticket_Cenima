import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class UserService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}${API_ENDPOINTS.USERS}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAll() {
    try {
      const response = await this.api.get('/');
      return response.data.data || response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getByEmail(email) {
    try {
      const response = await this.api.get(`/${email}`);
      return response.data.data || response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(userData) {
    try {
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        formData.append(key, userData[key]);
      });
      
      const response = await this.api.post('/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(email, userData) {
    try {
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        formData.append(key, userData[key]);
      });
      
      const response = await this.api.put(`/${email}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(email) {
    try {
      const response = await this.api.delete(`/${email}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePassword(email, password, confirmPassword) {
    try {
      const response = await this.api.post('/update-password-forgetpassword', {
        email,
        password,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePassword(email, oldPassword, password, confirmPassword) {
    try {
      const response = await this.api.post('/change-password-upadateprofile', {
        email,
        oldPassword,
        password,
        confirmPassword
      });
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

export default new UserService(); 