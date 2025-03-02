import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',  // Ensure correct API base URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to headers for every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Handle token expiration and refresh
api.interceptors.response.use(
    response => response,
    async error => {
        if (error.response && error.response.status === 401) {
            console.warn('Token expired. Attempting refresh...');
            try {
                const refreshToken = localStorage.getItem('refresh');
                if (!refreshToken) {
                    console.error('No refresh token found.');
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
                    refresh: refreshToken
                });

                localStorage.setItem('token', response.data.access);
                error.config.headers.Authorization = `Bearer ${response.data.access}`;

                return api.request(error.config);  // Retry failed request with new token
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
