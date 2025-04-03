import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

// สร้าง Context
const AuthContext = createContext();

// สร้าง Provider
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // ตรวจสอบผู้ใช้เมื่อโหลดแอพ
    const user = authService.getCurrentUser();
    const token = authService.getToken();
    
    if (user && token) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  // ฟังก์ชั่นสำหรับล็อกอิน
  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await authService.login(username, password);
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชั่นสำหรับล็อกเอาท์
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // ฟังก์ชั่นสำหรับลงทะเบียน
  const register = async (userData) => {
    setLoading(true);
    try {
      return await authService.register(
        userData.username,
        userData.email,
        userData.password,
        userData.department
      );
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชั่นสำหรับอัพเดทโปรไฟล์
  const updateProfile = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.updateProfile(userData);
      setCurrentUser(response.user);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ค่าที่ส่งไปให้ Context
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// สร้าง Custom Hook
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;