import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class CommentService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}${API_ENDPOINTS.COMMENTS}`,
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

  // Tạo bình luận mới
  async create(commentData) {
    try {
      const response = await this.api.post('/', commentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy bình luận theo phim
  async getByMovie(movieId, options = {}) {
    try {
      const { page = 1, pageSize = 10, sort = 'newest', includeReplies = true, approvedOnly = true } = options;
      const response = await this.api.get(`/movie/${movieId}`, {
        params: { page, pageSize, sort, includeReplies, approvedOnly }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy bình luận của user
  async getByUser(userId) {
    try {
      const response = await this.api.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cập nhật bình luận
  async update(commentId, userId, commentData, isAdmin = false) {
    try {
      const response = await this.api.put(`/${commentId}`, commentData, {
        params: { userId, isAdmin }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Xóa bình luận
  async delete(commentId, userId, isAdmin = false) {
    try {
      await this.api.delete(`/${commentId}`, {
        params: { userId, isAdmin }
      });
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy số lượng bình luận của phim
  async getCountByMovie(movieId) {
    try {
      const response = await this.api.get(`/movie/${movieId}/count`);
      return response.data.count;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin: Duyệt bình luận
  async approve(commentId) {
    try {
      await this.api.put(`/api/admin/comments/${commentId}/approve`);
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin: Lấy tất cả bình luận
  async getAllAdmin(filters = {}) {
    try {
      const response = await this.api.get('/api/admin/comments', { params: filters });
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

export default new CommentService(); 