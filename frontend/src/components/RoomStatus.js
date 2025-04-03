import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Event as EventIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { roomService } from '../services/roomService';
import { formatDate, formatTime } from '../utils/formatDate';

const RoomStatus = ({ roomId }) => {
  const [roomStatus, setRoomStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoomStatus = async () => {
    setLoading(true);
    try {
      const status = await roomService.getRoomStatus(roomId);
      setRoomStatus(status);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch room status');
      console.error('Error fetching room status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoomStatus();
    }
  }, [roomId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'booked':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress size={40} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!roomStatus) {
    return (
      <Card>
        <CardContent>
          <Typography>Room information not available</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{roomStatus.name}</Typography>
          <Tooltip title="Refresh status">
            <IconButton onClick={fetchRoomStatus} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1" sx={{ mr: 1 }}>Status:</Typography>
          <Chip 
            label={roomStatus.status} 
            color={getStatusColor(roomStatus.status)} 
            size="small"
          />
        </Box>
        
        <Typography variant="body2" gutterBottom>
          Capacity: {roomStatus.capacity} people | Location: {roomStatus.location}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        {roomStatus.currentBooking ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Currently Booked
            </Typography>
            <Box sx={{ bgcolor: 'error.light', p: 1, borderRadius: 1, color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EventIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  {formatDate(roomStatus.currentBooking.startTime)} {formatTime(roomStatus.currentBooking.startTime)} - {formatDate(roomStatus.currentBooking.endTime)} {formatTime(roomStatus.currentBooking.endTime)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  {roomStatus.currentBooking.user.username}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                {roomStatus.currentBooking.purpose}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography variant="subtitle1" gutterBottom color="success.main">
            Currently Available
          </Typography>
        )}
        
        {roomStatus.upcomingBookings.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Upcoming Bookings
            </Typography>
            <List dense>
              {roomStatus.upcomingBookings.map((booking) => (
                <ListItem key={booking._id} disablePadding sx={{ mb: 1 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        {formatDate(booking.startTime)} {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" display="block">
                        {booking.user.username}: {booking.purpose}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RoomStatus;