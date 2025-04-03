import React from 'react';
import { Container, Typography, Grid, Paper } from '@mui/material';
import UserProfile from '../components/UserProfile';

const Profile = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Your Profile
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <UserProfile />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;