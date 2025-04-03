import React, { useState, useEffect } from 'react';
import { Grid, Typography, Paper, Box,Card,CardContent,CardHeader,Divider} from '@mui/material';
import RoomList from '../components/RoomList';
import Calendar from '../components/Calendar';
import LoadingSpinner from '../components/LoadingSpinner';
import { bookingService } from '../services/bookingService';
import { roomService } from '../services/roomService';
import { useAuth } from '../contexts/AuthContext';
import RoomStatus from '../components/RoomStatus';

const Dashboard = () => {
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState(null);

  useEffect(() => {
    // const fetchBookings = async () => {
    const fetchData = async () => {
      try {
        // console.log("fetchBooking");
        const bookings = await bookingService.getUserBookings();
        // Filter for upcoming bookings
        const now = new Date();
        const upcoming = bookings
          .filter(booking => new Date(booking.startTime) > now && booking.status !== 'cancelled')
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
          .slice(0, 5); // Get only the next 5 bookings
        
        setUpcomingBookings(upcoming);
        setError(null);
      } catch (err) {
        setError('Failed to load bookings');
        console.error('Error fetching booking: ', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRooms = async () => {
      setRoomsLoading(true);
      try {
        // console.log("fetchBooking");
        const roomData = await roomService.getAllRooms();
        setRooms(roomData);
        setRoomsError(null);

        if(roomData.length > 0){
          setSelectedRoom(roomData[0]._id);
        }
      } catch (err) {
        setRoomsError('Failed to load room data');
        console.error('Error fetching rooms: ', err);
      } finally {
        setRoomsLoading(false);
      }
    };

    fetchData();
    fetchRooms();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Welcome back, {currentUser?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your meeting room bookings from this dashboard.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Your Calendar
            </Typography>
            <Calendar />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Upcoming Bookings" 
              titleTypographyProps={{ variant: 'h6' }} 
            />
            <Divider />
            <CardContent>
              {loading ? (
                <LoadingSpinner size={30} message="Loading your bookings..." />
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : upcomingBookings.length == 0 ? (
                <Typography>You have no upcoming bookings.</Typography>
              ) : (
                upcomingBookings.map((booking) => (
                  <Box 
                    key={booking._id} 
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      border: '1px solid #eee', 
                      borderRadius: 1 
                    }}
                  >
                    <Typography variant="subtitle1">
                      {booking.room.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleTimeString()}
                    </Typography>
                    <Typography variant="body2">
                      {booking.purpose}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item md={6} xs={12}>
          <Paper elevation={3}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Available Rooms</Typography>
              {roomsLoading ? (
                <LoadingSpinner size={30} message='Loading rooms...' />
              ) : roomsError ? (
                <Typography color="error">{roomsError}</Typography>
              ) : (
                <RoomList 
                  rooms={rooms}
                  onSelectRoom={(room) => setSelectedRoom(room._id)} 
                  loading={roomsLoading}
                  error={roomsError}
                />
              )};
            </Box>
          </Paper>
        </Grid>

        {/* เพิ่มส่วนแสดงสถานะห้อง:*/}
        <Grid item md={6} xs={12}>
          <Paper elevation={3}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Room Status</Typography>
              {selectedRoom ? (
                <RoomStatus roomId={selectedRoom} />
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  Select a room to view its status
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;