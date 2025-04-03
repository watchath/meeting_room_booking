import axios from 'axios';
import { authService } from './authService';

// const API_URL = 'http://localhost:5000/api/bookings';
const API_URL = `${process.env.REACT_APP_API_URL}/bookings`;

export const bookingService = {
  async createBooking(bookingData) {
    try {
      const token = authService.getToken();
      const response = await axios.post(API_URL, bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create booking' };
    }
  },

  async getUserBookings() {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch bookings' };
    }
  },

  async getAllBookings() {
    try {
      const token = authService.getToken();
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch all bookings' };
    }
  },

  async getBookingById(id) {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch booking details' };
    }
  },

  async cancelBooking(id) {
    try {
      const token = authService.getToken();
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel booking' };
    }
  },

  async checkRoomAvailability(roomId, date) {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/availability`, {
        params: { roomId, date },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to check availability' };
    }
  },

  // อัพเดทสถานะการจอง
  async updateBookingStatus(bookingId, status) {
    try {
      const token = authService.getToken();
      const response = await axios.put(`${API_URL}/${bookingId}/status`, {
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update booking status' };
    }
  },

  // ดึงข้อมูลสถิติการจอง
  async getBookingStats() {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/stats/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch booking statistics' };
    }
  },

  // ตรวจสอบการจองซ้ำซ้อนของผู้ใช้
  async checkUserOverlappingBookings(startTime, endTime){
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/check-overlapping`, {
        params: { startTime, endTime },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to check overlapping bookings' };
    }
  }
};