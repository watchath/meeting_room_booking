import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import RegisterForm from '../components/RegisterForm';

const Register = () => {
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
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join our meeting room booking platform
            </Typography>
          </Box>
          
          <RegisterForm />
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;