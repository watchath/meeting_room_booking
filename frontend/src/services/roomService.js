import axios from 'axios';
import { authService } from './authService';

// const API_URL = 'http://localhost:5000/api/rooms';
const API_URL = `${process.env.REACT_APP_API_URL}/rooms`;

export const roomService = {
  async getAllRooms() {
    try {
      const token = authService.getToken();
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch rooms' };
    }
  },

  async getRoomById(id) {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch room details' };
    }
  },

  async createRoom(roomData) {
    try {
      const token = authService.getToken();
      const response = await axios.post(API_URL, roomData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create room' };
    }
  },

  async updateRoom(id, roomData) {
    try {
      const token = authService.getToken();
      const response = await axios.put(`${API_URL}/${id}`, roomData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update room' };
    }
  },

  async deleteRoom(id) {
    try {
      const token = authService.getToken();
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete room' };
    }
  },

  // เพิ่มฟังก์ชันดึงข้อมูลสถิติห้อง
  async getRoomStats() {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/stats/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch room statistics' };
    }
  },

  // เพิ่มฟังก์ชันดึงสถานะห้อง
  async getRoomStatus(roomId) {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/${roomId}/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch room status' };
    }
  },

  // สำหรับ admin - อัพเดทสถานะห้องทั้งหมด
  async updateAllRoomStatus() {
    try {
      const token = authService.getToken();
      const response = await axios.post(`${API_URL}/update-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update room status' };
    }
  },

  async getAvailableRooms(startTime, endTime) {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/find-available`, {
        params: { startTime, endTime },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch available rooms' };
    }
  }

};