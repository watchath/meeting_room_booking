import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  FormHelperText,
  Paper,
  Alert,
  Grid,
  Divider,
  Step,
  Stepper,
  StepLabel,
  StepContent,
  CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { bookingService } from '../services/bookingService';
import { roomService } from '../services/roomService';
import { useForm } from '../hooks/useForm';
import { isValidBooking, isPastDate } from '../utils/validators';

const BookingForm = () => {
  // State เพื่อจัดการขั้นตอนการจอง
  const [activeStep, setActiveStep] = useState(0);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState(null);

  // State สำหรับการจัดการการจอง
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // State สำหรับการแสดงข้อผิดพลาดในแต่ละขั้นตอน
  const [stepError, setStepError] = useState(null);

  // ฟังก์ชันตรวจสอบความถูกต้องของฟอร์ม
  const validateForm = (values) => {
    const errors = {};
    
    if (activeStep === 0) {
      if (!values.startTime) {
        errors.startTime = 'Please select a start time';
      } else if (isPastDate(values.startTime)) {
        errors.startTime = 'Cannot book in the past';
      }
      
      if (!values.endTime) {
        errors.endTime = 'Please select an end time';
      } else if (values.startTime && !isValidBooking(values.startTime, values.endTime)) {
        errors.endTime = 'End time must be after start time';
      }
    } else if (activeStep === 1) {
      if (!values.roomId) {
        errors.roomId = 'Please select a room';
      }
    } else if (activeStep === 2) {
      if (!values.purpose || !values.purpose.trim()) {
        errors.purpose = 'Please enter the purpose of the meeting';
      }
    }
    
    return errors;
  };

  // ใช้ custom hook useForm
  const { 
    values: formData, 
    errors: formErrors, 
    handleChange, 
    handleSubmit,
    setValues,
    reset,
    setFieldError
  } = useForm({
    roomId: '',
    startTime: null,
    endTime: null,
    purpose: ''
  }, validateForm);

  // ฟังก์ชันสำหรับโหลดห้องที่ว่างในช่วงเวลาที่เลือก
  const fetchAvailableRooms = async () => {
    if (!formData.startTime || !formData.endTime) {
      setStepError("Please select both start and end time");
      return false;
    }

    setRoomLoading(true);
    setRoomError(null);
    setStepError(null);
    
    try {
      const result = await roomService.getAvailableRooms(
        formData.startTime.toISOString(), 
        formData.endTime.toISOString()
      );
      
      setAvailableRooms(result.availableRooms || []);
      
      // Reset room selection if previously selected room is not available
      if (formData.roomId && !result.availableRooms.some(room => room._id === formData.roomId)) {
        setValues({ ...formData, roomId: '' });
      }
      
      // Check if there are any available rooms
      if (result.availableRooms.length === 0) {
        setStepError("No rooms available during this time period. Please select different time.");
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error fetching available rooms:', err);
      setRoomError(err.message || 'Error fetching available rooms');
      setStepError("Failed to fetch available rooms. Please try again.");
      setAvailableRooms([]);
      return false;
    } finally {
      setRoomLoading(false);
    }
  };

  // ฟังก์ชันเปลี่ยนขั้นตอน
  const handleNext = async () => {
    // Clear step error
    setStepError(null);
    
    // Validate current step
    const errors = validateForm(formData);
    
    if (Object.keys(errors).length === 0) {
      if (activeStep === 0) {
        // Fetch available rooms when moving to step 2
        try {
          const success = await fetchAvailableRooms();
          if (success) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
          }
        } catch (err) {
          console.error("Error in fetchAvailableRooms:", err);
          setStepError("Error fetching available rooms: " + (err.message || "Unknown error"));
        }
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    } else {
      // Set errors for individual fields
      Object.keys(errors).forEach(fieldName => {
        setFieldError(fieldName, errors[fieldName]);
      });
      
      // Show step error message
      const errorMessages = Object.values(errors);
      if (errorMessages.length > 0) {
        setStepError(errorMessages[0]);
      }
    }
  };

  const handleBack = () => {
    setStepError(null);
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    reset();
    setRoomError(null);
    setStepError(null);
    setAvailableRooms([]);
  };

  const handleDateChange = (name, value) => {
    setValues({
      ...formData,
      [name]: value
    });
    
    // Clear any previous room error when dates change
    setRoomError(null);
    setStepError(null);
  };

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    setStepError(null);
    
    try {
      // Ensure the data is properly formatted
      const bookingData = {
        ...data,
        startTime: data.startTime instanceof Date ? data.startTime.toISOString() : data.startTime,
        endTime: data.endTime instanceof Date ? data.endTime.toISOString() : data.endTime
      };
      // console.log(bookingData)
      await bookingService.createBooking(bookingData);
      setSuccess(true);
      handleReset(); // Reset form after successful submission
      setActiveStep(3); // Move to the success step
    } catch (err) {
      console.error("Error creating booking:", err);
      setError(err.message || 'Failed to create booking. Please try again.');
      setStepError("Booking failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Stepper content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(value) => handleDateChange('startTime', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.startTime,
                      helperText: formErrors.startTime
                    }
                  }}
                  disabled={loading}
                  minDateTime={new Date()}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="End Time"
                  value={formData.endTime}
                  onChange={(value) => handleDateChange('endTime', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.endTime,
                      helperText: formErrors.endTime
                    }
                  }}
                  disabled={loading}
                  minDateTime={formData.startTime || new Date()}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {roomLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Loading available rooms...</Typography>
                </Box>
              ) : roomError ? (
                <Alert severity="error">{roomError}</Alert>
              ) : availableRooms.length === 0 ? (
                <Alert severity="info">
                  No rooms available for the selected time period. Please select a different time.
                </Alert>
              ) : (
                <FormControl fullWidth error={!!formErrors.roomId}>
                  <InputLabel>Room</InputLabel>
                  <Select
                    name="roomId"
                    value={formData.roomId}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {availableRooms.map((room) => (
                      <MenuItem key={room._id} value={room._id}>
                        {room.name} - Capacity: {room.capacity}, Location: {room.location}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.roomId && <FormHelperText>{formErrors.roomId}</FormHelperText>}
                </FormControl>
              )}
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="purpose"
                label="Purpose of Meeting"
                value={formData.purpose}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                error={!!formErrors.purpose}
                helperText={formErrors.purpose}
                disabled={loading}
              />
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Book a Meeting Room</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Booking created successfully!</Alert>}
      
      {/* Step Error Alert */}
      {stepError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {stepError}
        </Alert>
      )}
      
      <Stepper activeStep={activeStep} orientation="vertical">
        <Step>
          <StepLabel>Select Time</StepLabel>
          <StepContent>
            {getStepContent(0)}
            <Box sx={{ mb: 2, mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ mt: 1, mr: 1 }}
                disabled={!formData.startTime || !formData.endTime || loading}
              >
                Next
              </Button>
            </Box>
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Select Room</StepLabel>
          <StepContent>
            {getStepContent(1)}
            <Box sx={{ mb: 2, mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ mt: 1, mr: 1 }}
                disabled={!formData.roomId || roomLoading || availableRooms.length === 0 || loading}
              >
                Next
              </Button>
              <Button
                onClick={handleBack}
                sx={{ mt: 1, mr: 1 }}
                disabled={loading}
              >
                Back
              </Button>
            </Box>
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Meeting Details</StepLabel>
          <StepContent>
            {getStepContent(2)}
            <Box sx={{ mb: 2, mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit(onSubmit)}
                sx={{ mt: 1, mr: 1 }}
                disabled={loading || !formData.purpose}
              >
                {loading ? 'Booking...' : 'Book Room'}
              </Button>
              <Button
                onClick={handleBack}
                sx={{ mt: 1, mr: 1 }}
                disabled={loading}
              >
                Back
              </Button>
            </Box>
          </StepContent>
        </Step>
      </Stepper>
      
      {activeStep === 3 && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>Booking completed!</Typography>
          <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            Make Another Booking
          </Button>
        </Paper>
      )}
    </Paper>
  );
};

export default BookingForm;
