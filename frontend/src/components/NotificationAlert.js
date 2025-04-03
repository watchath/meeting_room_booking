import React, { useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const NotificationAlert = ({ message, severity, open, onClose }) => {
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={onClose}>
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationAlert;