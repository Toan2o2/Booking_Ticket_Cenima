import axios from 'axios';
import { Person } from '../models/Person';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class PersonService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}${API_ENDPOINTS.PERSONS}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  buildFormData(dto, photoFile) {
    const formData = new FormData();
    if (dto.Name) formData.append('Name', dto.Name);
    if (dto.DateOfBirth) formData.append('DateOfBirth', dto.DateOfBirth);
    if (dto.Biography) formData.append('Biography', dto.Biography);
    if (dto.Nationality) formData.append('Nationality', dto.Nationality);
    if (photoFile) formData.append('Photo', photoFile);
    return formData;
  }

  async getAll() {
    try {
      const response = await this.api.get('/');
      return response.data.map(person => Person.fromApi(person));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getById(id) {
    try {
      const response = await this.api.get(`/${id}`);
      return Person.fromApi(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(personData, photoFile = null) {
    try {
      const dto = personData.toCreateUpdateDto();
      const formData = this.buildFormData(dto, photoFile);
      const response = await this.api.post('/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(id, personData, photoFile = null) {
    try {
      const dto = personData.toCreateUpdateDto();
      const formData = this.buildFormData(dto, photoFile);
      const response = await this.api.put(`/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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

  async getAllActors() {
    try {
      const response = await this.api.get('/actors');
      return response.data.map(person => Person.fromApi(person));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAllDirectors() {
    try {
      const response = await this.api.get('/directors');
      return response.data.map(person => Person.fromApi(person));
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

export default new PersonService(); 