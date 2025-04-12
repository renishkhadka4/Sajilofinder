import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized! Attempting token refresh...');

      const refreshToken = localStorage.getItem('refresh');
      if (!refreshToken) {
        console.error('No refresh token available.');
        window.dispatchEvent(new CustomEvent("unauthorized")); // 👈 trigger modal login
        return Promise.reject(error);
      }

      try {
        const res = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        localStorage.setItem('token', newAccessToken);

        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return api.request(error.config); // retry original request
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        localStorage.clear();
        window.dispatchEvent(new CustomEvent("unauthorized")); // 👈 trigger modal login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
