import axios from 'axios';
import { City } from '../models/City';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class CityService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}${API_ENDPOINTS.CITIES || '/City'}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  buildDto(cityData) {
    const dto = cityData.toCreateUpdateDto();
    return { Name: dto.Name };
  }

  async getAll() {
    try {
      const response = await this.api.get('/');
      return response.data.map(city => City.fromApi(city));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getById(id) {
    try {
      const response = await this.api.get(`/${id}`);
      return City.fromApi(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(cityData) {
    try {
      const dto = this.buildDto(cityData);
      const response = await this.api.post('/', dto);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(id, cityData) {
    try {
      const dto = this.buildDto(cityData);
      const response = await this.api.put(`/${id}`, dto);
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
      return new Error(error.response.data.message || 'Có lỗi xảy ra');
    }
    return new Error('Không thể kết nối đến server');
  }
}

export default new CityService(); 