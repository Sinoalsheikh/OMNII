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
      // Clear token and redirect to login only if not already on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const authService = {
  login: async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  register: async (userData) => {
    try {
      console.log('Attempting registration:', { ...userData, password: '[HIDDEN]' });
      const response = await axios.post(`${API_URL}/api/auth/register`, userData);
      console.log('Registration response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;
