import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Grid,
  Box,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  ArrowBackIos,
  ArrowForwardIos
} from '@mui/icons-material';
import { bookingService } from '../services/bookingService';
import { formatDate, formatTime, getMonthRange } from '../utils/formatDate';
import { useBoolean } from '../hooks/useBoolean';
import styles from '../components/Calendar.module.css';

const Calendar = () => {
  const [bookings, setBookings] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, isLoading] = useBoolean(true);
  const [error, setError] = useState(null);

  // Get month and year names
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  useEffect(() => {
    const fetchBookings = async () => {
      isLoading.setTrue();
      try {
        const bookingData = await bookingService.getUserBookings();
        setBookings(bookingData);
      } catch (error) {
        console.error('Error fetching bookings', error);
        setError('Failed to load bookings');
      } finally {
        isLoading.setFalse();
      }
    };

    fetchBookings();
  }, []);

  // Go to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Go to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Get days in month
  const getDaysInMonth = () => {
    return new Date(
      currentMonth.getFullYear(), 
      currentMonth.getMonth() + 1, 
      0
    ).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = () => {
    return new Date(
      currentMonth.getFullYear(), 
      currentMonth.getMonth(), 
      1
    ).getDay();
  };

  // Check if a date is today
  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  // Render calendar grid
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const days = [];
    
    // Days of week header
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
      days.push(
        <Grid 
          item 
          key={`header-${day}`} 
          xs={1.71} 
          className={styles.dayHeader}
        >
          {day}
        </Grid>
      );
    });
    
    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <Grid 
          item 
          key={`empty-${i}`} 
          xs={1.71} 
          className={styles.calendarDay}
          sx={{ bgcolor: '#f9f9f9' }}
        />
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      
      // Get bookings for this day
      const dayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.startTime);
        return bookingDate.getDate() === day && 
               bookingDate.getMonth() === currentMonth.getMonth() &&
               bookingDate.getFullYear() === currentMonth.getFullYear();
      });
      
      days.push(
        <Grid 
          item 
          key={`day-${day}`} 
          xs={1.71} 
          className={`${styles.calendarDay} ${isToday(day) ? styles.today : ''}`}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">
              {day}
            </Typography>
            {dayBookings.length > 0 && (
              <Badge badgeContent={dayBookings.length} color="primary" />
            )}
          </Box>
          
          <Box sx={{ mt: 1, overflow: 'hidden' }}>
            {dayBookings.slice(0, 2).map((booking) => (
              <Tooltip
                key={booking._id}
                title={`${booking.room.name}: ${booking.purpose}`}
                arrow
                placement="top"
              >
                <Box className={styles.calendarEvent}>
                  {formatTime(booking.startTime)}
                  {' - '}
                  {booking.room.name}
                </Box>
              </Tooltip>
            ))}
            {dayBookings.length > 2 && (
              <Typography variant="caption" color="text.secondary">
                +{dayBookings.length - 2} more
              </Typography>
            )}
          </Box>
        </Grid>
      );
    }
    
    return days;
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={prevMonth}>
          <ArrowBackIos fontSize="small" />
        </IconButton>
        
        <Typography variant="h6">
          {monthName} {year}
        </Typography>
        
        <IconButton onClick={nextMonth}>
          <ArrowForwardIos fontSize="small" />
        </IconButton>
      </Box>
      
      {loading ? (
        <Typography align="center" py={4}>Loading calendar...</Typography>
      ) : error ? (
        <Typography color="error" align="center" py={4}>{error}</Typography>
      ) : (
        <Grid container className="fade-in">
          {renderCalendarDays()}
        </Grid>
      )}
    </Paper>
  );
};

export default Calendar;