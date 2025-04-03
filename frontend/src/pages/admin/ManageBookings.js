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
  IconButton,
  Chip,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tabs,
  Tab,
  Tooltip,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatTime } from '../../utils/formatDate';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState({ open: false, bookingId: null, status: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const bookingData = await bookingService.getAllBookings();
      setBookings(bookingData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
  };

  const handleStatusChange = (bookingId, status) => {
    setStatusDialog({ open: true, bookingId, status });
  };

  const handleStatusConfirm = async () => {
    if (!statusDialog.bookingId) return;

    setLoading(true);
    try {
      const updatedBooking = await bookingService.updateBookingStatus(
        statusDialog.bookingId, 
        statusDialog.status
      );
      
      // Update bookings in state
      setBookings(bookings.map(booking => 
        booking._id === statusDialog.bookingId ? updatedBooking : booking
      ));
      
      setSuccess(`Booking ${statusDialog.status} successfully`);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || `Failed to ${statusDialog.status} booking`);
    } finally {
      setLoading(false);
      setStatusDialog({ open: false, bookingId: null, status: '' });
    }
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

  // Filter bookings based on selected tab
  const filteredBookings = (() => {
    switch (tabValue) {
      case 0: // All bookings
        return bookings;
      case 1: // Pending bookings
        return bookings.filter(booking => booking.status === 'pending');
      case 2: // Confirmed bookings
        return bookings.filter(booking => booking.status === 'confirmed');
      case 3: // Cancelled bookings
        return bookings.filter(booking => booking.status === 'cancelled');
      default:
        return bookings;
    }
  })();

  // Sort bookings by start time (newest first)
  const sortedBookings = [...filteredBookings].sort(
    (a, b) => new Date(b.startTime) - new Date(a.startTime)
  );

  if (loading && bookings.length === 0) {
    return <LoadingSpinner message="Loading bookings..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Bookings
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Bookings" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Pending
                {bookings.filter(b => b.status === 'pending').length > 0 && (
                  <Chip 
                    label={bookings.filter(b => b.status === 'pending').length} 
                    color="warning" 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            }
          />
          <Tab label="Confirmed" />
          <Tab label="Cancelled" />
        </Tabs>
      </Paper>
      
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Room</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" py={3}>
                      No bookings found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedBookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>{booking.room.name}</TableCell>
                    <TableCell>{booking.user.username}</TableCell>
                    <TableCell>{formatDate(booking.startTime)} {formatTime(booking.startTime)}</TableCell>
                    <TableCell>{formatDate(booking.endTime)} {formatTime(booking.endTime)}</TableCell>
                    <TableCell>
                      <Typography 
                        sx={{ 
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {booking.purpose}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton 
                          color="info" 
                          onClick={() => handleViewBooking(booking)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {booking.status === 'pending' && (
                        <Tooltip title="Confirm Booking">
                          <IconButton 
                            color="success" 
                            onClick={() => handleStatusChange(booking._id, 'confirmed')}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {booking.status !== 'cancelled' && (
                        <Tooltip title="Cancel Booking">
                          <IconButton 
                            color="error" 
                            onClick={() => handleStatusChange(booking._id, 'cancelled')}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* View Booking Dialog */}
      <Dialog
        open={viewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedBooking && (
          <>
            <DialogTitle>
              Booking Details
              <Chip
                label={selectedBooking.status}
                color={getStatusColor(selectedBooking.status)}
                size="small"
                sx={{ ml: 2 }}
              />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Room</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedBooking.room.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Location</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedBooking.room.location}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Start Time</Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedBooking.startTime)} {formatTime(selectedBooking.startTime)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">End Time</Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedBooking.endTime)} {formatTime(selectedBooking.endTime)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Booked By</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedBooking.user.username} ({selectedBooking.user.email})
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Department</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedBooking.user.department || 'Not specified'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Purpose</Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ p: 2, bgcolor: 'background.paper', mt: 1 }}
                  >
                    <Typography variant="body1">
                      {selectedBooking.purpose}
                    </Typography>
                  </Paper>
                </Grid>
                
                {selectedBooking.participants && selectedBooking.participants.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Participants</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {selectedBooking.participants.map((participant, index) => (
                        <Chip 
                          key={index} 
                          label={participant.username || participant}
                          variant="outlined"
                          size="small" 
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Booking Created</Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedBooking.createdAt)} {formatTime(selectedBooking.createdAt)}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseViewDialog}>Close</Button>
              
              {selectedBooking.status === 'pending' && (
                <Button 
                  variant="contained" 
                  color="success" 
                  startIcon={<CheckCircleIcon />}
                  onClick={() => {
                    handleCloseViewDialog();
                    handleStatusChange(selectedBooking._id, 'confirmed');
                  }}
                >
                  Confirm
                </Button>
              )}
              
              {selectedBooking.status !== 'cancelled' && (
                <Button 
                  variant="contained" 
                  color="error" 
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    handleCloseViewDialog();
                    handleStatusChange(selectedBooking._id, 'cancelled');
                  }}
                >
                  Cancel
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Status Change Confirmation Dialog */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ ...statusDialog, open: false })}
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {statusDialog.status === 'confirmed' 
              ? 'Are you sure you want to confirm this booking?' 
              : 'Are you sure you want to cancel this booking?'
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setStatusDialog({ ...statusDialog, open: false })}
            color="primary"
          >
            No
          </Button>
          <Button 
            onClick={handleStatusConfirm} 
            color={statusDialog.status === 'confirmed' ? 'success' : 'error'} 
            variant="contained"
          >
            Yes, {statusDialog.status === 'confirmed' ? 'Confirm' : 'Cancel'} Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageBookings;