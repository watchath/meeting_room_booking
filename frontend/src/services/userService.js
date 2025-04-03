import axios from 'axios';
import { authService } from './authService';

const API_URL = `${process.env.REACT_APP_API_URL}/users`;

export const userService = {
  async getAllUsers() {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch users' };
    }
  },

  async getUserById(id) {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user details' };
    }
  },

  async updateUser(id, userData) {
    try {
      const token = authService.getToken();
      const response = await axios.put(`${API_URL}/${id}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update user' };
    }
  },

  async updateUserRole(id, role) {
    try {
      const token = authService.getToken();
      const response = await axios.put(`${API_URL}/${id}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update user role' };
    }
  },

  async deleteUser(id) {
    try {
      const token = authService.getToken();
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete user' };
    }
  }
};
