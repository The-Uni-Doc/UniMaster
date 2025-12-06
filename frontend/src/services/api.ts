import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const response = await axios.post(API_URL + 'token/refresh/', {
                        refresh: refreshToken,
                    });

                    localStorage.setItem('access_token', response.data.access);
                    api.defaults.headers['Authorization'] = `Bearer ${response.data.access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;

                    return api(originalRequest);
                } catch (err) {
                    console.log('Refresh failed, redirecting to login');
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/#/login';
                }
            } else {
                console.log('No refresh token, redirecting to login');
                window.location.href = '/#/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
