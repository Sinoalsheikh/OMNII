import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

// Add a request interceptor to add the auth token to requests
axios.interceptors.request.use(
  (config) => {
    config.headers = {
      ...config.headers,
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  register: async (userData) => {
    const response = await axios.post(`${API_URL}/api/auth/register`, userData);
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;
