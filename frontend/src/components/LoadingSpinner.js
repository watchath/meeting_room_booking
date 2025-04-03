import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...', size = 40 }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
      width="100%"
      minHeight="150px"
      p={3}
    >
      <CircularProgress size={size} />
      <Typography variant="body1" mt={2} align="center">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;