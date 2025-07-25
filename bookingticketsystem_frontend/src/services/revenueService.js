import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class RevenueService {
    constructor() {
        this.api = axios.create({
            baseURL: `${API_BASE_URL}${API_ENDPOINTS.REVENUE}`,
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
    async getUsers() {
        try {
            const response = await this.api.get('/NumberUsers');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getMovies() {
        try {
            const response = await this.api.get('/NumberMovies');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getShows() {
        try {
            const response = await this.api.get('/ScreeningToday');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getCinemas() {
        try {
            const response = await this.api.get('/NumberCinemas');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getBookings() {
        try {
            const response = await this.api.get('/NumberBookings');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getUtilizationRate() {
        try {
            const response = await this.api.get('/UtilizationRate');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getTicketsToday() {
        try {
            const response = await this.api.get('/TicketTodayInMonth');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async GetTop5Users() {
        try {
            const response = await this.api.get('/GetTop5Users');
            return response.data.data || response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async GetFillterUsers() {
        try {
            const response = await this.api.get('/fillterUser');
            return response.data.data || response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }
    async GetUserByMonths(year) {
        try {
            const response = await this.api.get(`/GetUsersByMonthsInYear?year=${year}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async GetCinemaTop() {
        try {
            const response = await this.api.get(`/CinemaTop`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async RevenueByCinemaFromStartToEnd(start, end) {
        try {
            const response = await this.api.get(`/RevenueByCinemaFromStartToEnd/${start}/${end}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async RevenueByCinema() {
        try {
            const response = await this.api.get(`/RevenueByCinema`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async GetMovieTop() {
        try {
            const response = await this.api.get(`/MovieTop`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async RevenueByMovies() {
        try {
            const response = await this.api.get(`/RevenueByMovies`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async RevenueByMoviesFromStartToEnd(start, end) {
        try {
            const response = await this.api.get(`/RevenueByMoviesFromStartToEnd/${start}/${end}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async RevenueFirstWeek_Month_YearByMovie(periodType) {
        try {
            const response = await this.api.get(`/RevenueFirstWeek_Month_YearByMovie/${periodType}`);
            return response.data;
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

export default new RevenueService(); 