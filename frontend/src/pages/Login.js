import React from 'react';
import { Container, Paper, Typography, Box, Grid } from '@mui/material';
import LoginForm from '../components/LoginForm';

const Login = () => {
  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to access your meeting room bookings
            </Typography>
          </Box>
          
          <LoginForm />
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;