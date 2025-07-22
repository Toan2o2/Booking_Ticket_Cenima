import axios from 'axios';
import { API_BASE_URL } from '../config/api';

class MovieFavoriteService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/MovieFavorite`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Thêm interceptor để tự động thêm token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        
        // Thử lấy token từ user object
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
          }
        }
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Thêm phim vào danh sách yêu thích
  async addFavorite(movieId) {
    try {
      const response = await this.api.post('/', {
        movieId: movieId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Xóa phim khỏi danh sách yêu thích
  async removeFavorite(movieId) {
    try {
      await this.api.delete(`/?movieId=${movieId}`);
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Kiểm tra phim có trong danh sách yêu thích không
  async checkFavorite(movieId) {
    try {
      const response = await this.api.get(`/check?movieId=${movieId}`);
      return response.data.isFavorite;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy danh sách phim yêu thích của user
  async getFavoritesByUser() {
    try {
      const response = await this.api.get('/user');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy số lượng người yêu thích một phim
  async getFavoriteCountByMovie(movieId) {
    try {
      const response = await this.api.get(`/movie/${movieId}/count`);
      return response.data.count;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy top phim được yêu thích nhiều nhất (chỉ thống kê)
  async getTop(limit = 10, fromDate = null, toDate = null) {
    try {
      let url = `/top?limit=${limit}`;
      if (fromDate) url += `&fromDate=${fromDate}`;
      if (toDate) url += `&toDate=${toDate}`;
      
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy top phim yêu thích với thông tin đầy đủ
  async getTopMovies(limit = 10, fromDate = null, toDate = null) {
    try {
      let url = `/top-movies?limit=${limit}`;
      if (fromDate) url += `&fromDate=${fromDate}`;
      if (toDate) url += `&toDate=${toDate}`;
      
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      if (error.response.status === 401) {
        return new Error('Vui lòng đăng nhập để thực hiện chức năng này');
      }
      return new Error(error.response.data.message || 'Có lỗi xảy ra');
    }
    return new Error('Không thể kết nối đến server');
  }
}

export default new MovieFavoriteService(); 