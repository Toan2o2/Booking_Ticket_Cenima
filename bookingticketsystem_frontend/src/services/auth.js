import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}${API_ENDPOINTS.AUTH}`,
      headers: {
        'Content-Type': 'application/json',
  },
    });
    this.userApi = axios.create({
      baseURL: `${API_BASE_URL}${API_ENDPOINTS.USERS}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async signIn({ email, password }) {
    try {
      const response = await this.api.post('/SignIn', {
        Email: email,
        PasswordHash: password
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async signUp({ name, email, password }) {
    try {
      // Đăng ký dùng form-data
      const formData = new FormData();
      formData.append('Name', name);
      formData.append('Email', email);
      formData.append('PasswordHash', password);
      const response = await this.api.post('/SignUp', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async loginWithGoogle(idToken) {
    try {
      const response = await this.api.post('/login-google', { idToken });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendOtp(email) {
    try {
      const response = await this.api.post('/send-otp', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword({ email, password, confirmPassword }) {
    try {
      const response = await this.userApi.post('/update-password-forgetpassword', {
        email,
        password,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
  }
  }

  handleError(error) {
    if (error.response && error.response.data && error.response.data.message) {
      return new Error(error.response.data.message);
    }
    return new Error('Không thể kết nối đến server');
  }
}

export default new AuthService(); 