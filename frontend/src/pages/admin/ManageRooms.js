import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
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
  Chip,
  Box,
  Grid,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MeetingRoom as MeetingRoomIcon
} from '@mui/icons-material';
import { roomService } from '../../services/roomService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useForm } from '../../hooks/useForm';
import { isValidCapacity } from '../../utils/validators';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, roomId: null });
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [amenitiesInput, setAmenitiesInput] = useState('');

  // Validation function for room form
  const validateRoomForm = (values) => {
    const errors = {};
    
    if (!values.name.trim()) {
      errors.name = 'Room name is required';
    }
    
    if (!values.capacity) {
      errors.capacity = 'Capacity is required';
    } else if (!isValidCapacity(values.capacity)) {
      errors.capacity = 'Capacity must be a positive number';
    }
    
    if (!values.location.trim()) {
      errors.location = 'Location is required';
    }
    
    return errors;
  };

  // Initialize form with custom hook
  const {
    values: roomData,
    errors: formErrors,
    handleChange,
    handleSubmit,
    setValues,
    reset
  } = useForm({
    name: '',
    capacity: '',
    location: '',
    status: 'available',
    amenities: []
  }, validateRoomForm);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const roomData = await roomService.getAllRooms();
      setRooms(roomData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch rooms');
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    reset(); // Reset form when opening dialog for new room
    setIsEditing(false);
    setCurrentRoomId(null);
    setAmenitiesInput('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleEditRoom = (room) => {
    setValues({
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      status: room.status,
      amenities: room.amenities || []
    });
    setAmenitiesInput('');
    setIsEditing(true);
    setCurrentRoomId(room._id);
    setOpenDialog(true);
  };

  const handleAddAmenity = () => {
    if (amenitiesInput.trim()) {
      const newAmenity = amenitiesInput.trim();
      if (!roomData.amenities.includes(newAmenity)) {
        setValues({
          ...roomData,
          amenities: [...roomData.amenities, newAmenity]
        });
      }
      setAmenitiesInput('');
    }
  };

  const handleRemoveAmenity = (amenity) => {
    setValues({
      ...roomData,
      amenities: roomData.amenities.filter(a => a !== amenity)
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.roomId) return;

    setLoading(true);
    try {
      await roomService.deleteRoom(deleteDialog.roomId);
      setRooms(rooms.filter(room => room._id !== deleteDialog.roomId));
      setSuccess('Room deleted successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete room');
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, roomId: null });
    }
  };

  const handleDeleteRoom = (roomId) => {
    setDeleteDialog({ open: true, roomId });
  };

  const onSubmitRoom = async (data) => {
    setLoading(true);
    try {
      if (isEditing && currentRoomId) {
        // Update existing room
        const updatedRoom = await roomService.updateRoom(currentRoomId, data);
        setRooms(rooms.map(room => 
          room._id === currentRoomId ? updatedRoom : room
        ));
        setSuccess('Room updated successfully');
      } else {
        // Create new room
        const newRoom = await roomService.createRoom(data);
        setRooms([...rooms, newRoom]);
        setSuccess('Room created successfully');
      }
      
      handleCloseDialog();
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  const handleAmenitiesInputChange = (e) => {
    setAmenitiesInput(e.target.value);
  };

  const handleAmenitiesInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAmenity();
    }
  };

  if (loading && rooms.length === 0) {
    return <LoadingSpinner message="Loading rooms..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Manage Rooms
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Room
        </Button>
      </Box>
      
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
      
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Amenities</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" py={3}>
                      No rooms found. Start by adding a new room.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => (
                  <TableRow key={room._id}>
                    <TableCell>{room.name}</TableCell>
                    <TableCell>{room.capacity}</TableCell>
                    <TableCell>{room.location}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {room.amenities && room.amenities.length > 0 ? (
                          room.amenities.map((amenity, index) => (
                            <Chip 
                              key={index} 
                              label={amenity} 
                              size="small"
                              variant="outlined"
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            None
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={room.status}
                        color={
                          room.status === 'available' 
                            ? 'success' 
                            : room.status === 'maintenance' 
                              ? 'error' 
                              : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Room">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEditRoom(room)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Room">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteRoom(room._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Add/Edit Room Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Edit Room' : 'Add New Room'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmitRoom)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Room Name"
                  fullWidth
                  value={roomData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="capacity"
                  label="Capacity"
                  type="number"
                  fullWidth
                  value={roomData.capacity}
                  onChange={handleChange}
                  error={!!formErrors.capacity}
                  helperText={formErrors.capacity}
                  required
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={roomData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="booked">Booked</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="location"
                  label="Location"
                  fullWidth
                  value={roomData.location}
                  onChange={handleChange}
                  error={!!formErrors.location}
                  helperText={formErrors.location}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    Amenities
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      value={amenitiesInput}
                      onChange={handleAmenitiesInputChange}
                      onKeyDown={handleAmenitiesInputKeyDown}
                      placeholder="e.g. Projector, Whiteboard"
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                    <Button 
                      variant="contained" 
                      onClick={handleAddAmenity} 
                      sx={{ ml: 1 }}
                      disabled={!amenitiesInput.trim()}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {roomData.amenities.map((amenity, index) => (
                    <Chip 
                      key={index} 
                      label={amenity} 
                      onDelete={() => handleRemoveAmenity(amenity)}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              startIcon={isEditing ? <EditIcon /> : <MeetingRoomIcon />}
            >
              {isEditing ? 'Update Room' : 'Add Room'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this room? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageRooms;
