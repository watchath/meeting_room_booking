import React, { createContext, useState, useContext } from 'react';

// สร้าง Context
const GlobalContext = createContext();

// สร้าง Provider
export const GlobalProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [globalError, setGlobalError] = useState(null);

  // Show global loading
  const showLoading = (show = true) => {
    setIsLoading(show);
  };

  // Show notification
  const showNotification = (message, type = 'info', duration = 5000) => {
    setNotification({ message, type, duration });
    
    // Auto hide notification after duration
    if (duration > 0) {
      setTimeout(() => {
        setNotification(null);
      }, duration);
    }
  };

  // Set global error
  const setError = (error) => {
    if (error) {
      const errorMessage = error.message || 'Unknown error occurred';
      setGlobalError(errorMessage);
      showNotification(errorMessage, 'error');
    } else {
      setGlobalError(null);
    }
  };

  // Clear all global states
  const clearStates = () => {
    setIsLoading(false);
    setNotification(null);
    setGlobalError(null);
  };

  // ค่าที่ส่งไปให้ Context
  const value = {
    isLoading,
    notification,
    globalError,
    showLoading,
    showNotification,
    setError,
    clearStates
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

// สร้าง Custom Hook
export const useGlobal = () => {
  return useContext(GlobalContext);
};

export default GlobalContext;