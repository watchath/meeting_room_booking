import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/users';
const API_URL = `${process.env.REACT_APP_API_URL}/users`;

export const authService = {
  async register(username, email, password, department) {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password,
        department
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  async login(username, password) {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password
      });
      
      // เก็บ Token ใน Local Storage เมื่อล็อกอินสำเร็จ
      console.log(response);
      console.log(response.data.token);
      if (response.data.token) {
        localStorage.setItem('user_token', response.data.token);
        localStorage.setItem('user_info', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  logout() {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
  },

  getCurrentUser() {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  },

  getToken() {
    return localStorage.getItem('user_token');
  },

  async updateProfile(userData) {
    try {
      const token = this.getToken();
      const response = await axios.put(`${API_URL}/profile`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local storage with new user info
      if (response.data.user) {
        localStorage.setItem('user_info', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Profile update failed' };
    }
  }
};