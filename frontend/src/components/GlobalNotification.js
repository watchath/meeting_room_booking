import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useGlobal } from '../contexts/GlobalContext';

const GlobalNotification = () => {
  const { notification, showNotification } = useGlobal();

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    showNotification(null);
  };

  if (!notification) return null;

  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={notification?.duration || 5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleClose} 
        severity={notification.type} 
        variant="filled"
        elevation={6}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalNotification;
