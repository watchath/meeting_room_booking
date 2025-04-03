import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  CurrencyBitcoin,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import { Tooltip } from 'recharts';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const bookingData = await bookingService.getUserBookings();
      setBookings(bookingData);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCancelBooking = async () => {
    if (!bookingToDelete) return;
    
    try {
      await bookingService.cancelBooking(bookingToDelete);
      // Refresh bookings after cancellation
      fetchBookings();
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  const openDeleteDialog = (bookingId) => {
    setBookingToDelete(bookingId);
    setDeleteDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // ตรวจสอบว่าการจองนี้ซ้ำซ้อนกับการจองอื่นหรือไม่
  const findOverlappingBookings = (currentBooking, allBookings) => {
    if(!currentBooking) return [];

    const currentStart = new Date(currentBooking.startTime);
    const currentEnd = new Date(currentBooking.endTime);

    return allBookings.filter(booking => {
      // ไม่นับตัวเอง
      if(booking._id === currentBooking) return false;
      // ไม่นับการจองที่ถูกยกเลิก
      if(booking.status === 'cancelled') return false;

      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);

      //ตรวจสอบการซ้ำซ้อน
      return (
        (bookingStart < currentEnd && bookingStart >= currentStart) ||
        (bookingEnd > currentStart && bookingEnd <= currentEnd) ||
        (bookingStart <= currentStart && bookingEnd >= currentEnd)
      );
    });
  };

  // Filter bookings based on selected tab
  const filteredBookings = (() => {
    const now = new Date();
    
    switch (tabValue) {
      case 0: // All bookings
        return bookings;
      case 1: // Upcoming bookings
        return bookings.filter(booking => 
          new Date(booking.startTime) > now && booking.status !== 'cancelled'
        );
      case 2: // Past bookings
        return bookings.filter(booking => 
          new Date(booking.endTime) < now || booking.status === 'cancelled'
        );
      default:
        return bookings;
    }
  })();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Bookings
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Bookings" />
          <Tab label="Upcoming" />
          <Tab label="Past" />
        </Tabs>
      </Paper>
      
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : filteredBookings.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No bookings found</Typography>
          <Typography variant="body2" color="text.secondary">
            You haven't made any bookings yet.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => window.location.href = '/book-room'}
          >
            Book a Room
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Room</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.map((booking) => {
                const isPast = new Date(booking.endTime) < new Date();
                const canCancel = !isPast && booking.status !== 'cancelled';
                const overlappingBookings = findOverlappingBookings(booking, bookings);
                const hasOverlap = overlappingBookings.length > 0;
                
                return (
                  <TableRow 
                    key={booking._id}
                    sx={hasOverlap ? {
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      '&:hover': {backgroundColor: 'rgba(255, 152, 0, 0.2)' }
                    } : {}}
                  >
                    <TableCell>{booking.room.name}</TableCell>
                    <TableCell>
                      {new Date(booking.startTime).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(booking.endTime).toLocaleString()}
                    </TableCell>
                    <TableCell>{booking.purpose}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={booking.status} 
                          color={getStatusColor(booking.status)}
                          size="small"
                        />
                        {hasOverlap && (
                          <Tooltip title={`ซ้ำซ้อนกับ ${overlappingBookings.length} การจองอื่น`}>
                            <Chip 
                              label='ซ้ำซ้อน' 
                              color='warning'
                              size="small"
                              variant='outlined'
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {canCancel && (
                        <IconButton 
                          color="error" 
                          onClick={() => openDeleteDialog(booking._id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            No, Keep It
          </Button>
          <Button onClick={handleCancelBooking} color="error" autoFocus>
            Yes, Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyBookings;