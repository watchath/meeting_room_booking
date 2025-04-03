import React from 'react';
import { 
  Container, 
  Typography,
  Paper,
  Box,
  Grid
} from '@mui/material';
import BookingForm from '../components/BookingForm';

const BookRoom = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Book a Meeting Room
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1" paragraph>
          Please follow these steps to book a meeting room:
        </Typography>
        <Typography component="ol" sx={{ pl: 2 }}>
          <li>Select the date and time for your meeting</li>
          <li>Choose from available rooms during that time</li>
          <li>Enter the purpose of your meeting</li>
        </Typography>
      </Paper>
      
      <BookingForm />
    </Container>
  );
};

export default BookRoom;
