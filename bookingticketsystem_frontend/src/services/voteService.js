import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class VoteService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}${API_ENDPOINTS.VOTES}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add JWT token interceptor
    this.api.interceptors.request.use(
      (config) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Tạo hoặc cập nhật đánh giá
  async createOrUpdate(voteData) {
    try {
      const response = await this.api.post('/', voteData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy đánh giá theo phim
  async getByMovie(movieId) {
    try {
      const response = await this.api.get(`/movie/${movieId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy đánh giá của user cho phim
  async getByUserAndMovie(userId, movieId) {
    try {
      const response = await this.api.get(`/user/${userId}/movie/${movieId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy thống kê đánh giá của phim
  async getMovieStats(movieId) {
    try {
      const response = await this.api.get(`/movie/${movieId}/stats`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cập nhật đánh giá
  async update(voteId, voteData) {
    try {
      const response = await this.api.put(`/${voteId}`, voteData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Xóa đánh giá
  async delete(voteId) {
    try {
      await this.api.delete(`/${voteId}`);
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy tất cả đánh giá (admin)
  async getAll(filters = {}) {
    try {
      const response = await this.api.get('/all', { params: filters });
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

export default new VoteService(); 