// src/pages/admin/AdminDashboard.js (อัพเดท)
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Divider,
  Alert,
  Button,
  Snackbar
} from '@mui/material';
import {
  MeetingRoom as MeetingRoomIcon,
  Event as EventIcon,
  Person as PersonIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Warning as WarningIcon,
  Today as TodayIcon,
  Verified as VerifiedIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Services
import { bookingService } from '../../services/bookingService';
import { roomService } from '../../services/roomService';
import { userService } from '../../services/userService';

// Components
import LoadingSpinner from '../../components/LoadingSpinner';
import StatsCard from '../../components/admin/StatsCard';
import BookingChart from '../../components/admin/BookingChart';
import TopUsersList from '../../components/admin/TopUsersList';
import RecentActivitiesList from '../../components/admin/RecentActivitiesList';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    rooms: {
      total: 0,
      available: 0
    },
    bookings: {
      total: 0,
      today: 0,
      pending: 0
    },
    users: {
      total: 0
    }
  });
  const [chartData, setChartData] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. ดึงข้อมูลสถิติห้อง
      const roomStats = await roomService.getRoomStats();
      
      // 2. ดึงข้อมูลสถิติการจอง
      const bookingStats = await bookingService.getBookingStats();
      
      // 3. ดึงข้อมูลสถิติผู้ใช้
      const users = await userService.getAllUsers();
      
      // 4. ดึงข้อมูลการจองล่าสุด
      const bookings = await bookingService.getAllBookings();
      const recent = bookings
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      // รวมข้อมูลสถิติ
      setStats({
        rooms: {
          total: roomStats.total || 0,
          available: roomStats.available || 0
        },
        bookings: {
          total: bookingStats.total || 0,
          today: bookingStats.today || 0,
          pending: bookingStats.pending || 0
        },
        users: {
          total: users.length || 0
        }
      });
      
      // เตรียมข้อมูลสำหรับกราฟ
      setChartData(bookingStats.monthlyData || []);
      
      // เตรียมข้อมูลผู้ใช้ที่มีการจองมากที่สุด
      setTopUsers(bookingStats.topUsers || []);
      
      // เตรียมข้อมูลการจองล่าสุด
      setRecentBookings(recent);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateRoomStatus = async () => {
    setUpdateStatus({ loading: true, success: false, error: null });
    try {
      await roomService.updateAllRoomStatus();
      setUpdateStatus({ loading: false, success: true, error: null });
      
      // รีเฟรชข้อมูลหลังจากอัพเดทสถานะห้อง
      fetchDashboardData();
    } catch (err) {
      setUpdateStatus({ loading: false, success: false, error: err.message || 'Update failed' });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Rooms" 
            value={stats.rooms.total} 
            icon={<MeetingRoomIcon />}
            color="primary"
            subtitle={`${stats.rooms.available} rooms available`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Bookings" 
            value={stats.bookings.total} 
            icon={<EventIcon />}
            color="success"
            subtitle={`${stats.bookings.today} bookings today`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Users" 
            value={stats.users.total} 
            icon={<PersonIcon />}
            color="info"
            subtitle="Total registered users"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Pending" 
            value={stats.bookings.pending} 
            icon={<WarningIcon />}
            color="warning"
            subtitle="Bookings need approval"
          />
        </Grid>
      </Grid>

      {/* Room Status Update Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleUpdateRoomStatus}
          disabled={updateStatus.loading}
        >
          {updateStatus.loading ? 'Updating Room Status...' : 'Update Room Status'}
        </Button>
      </Box>

      {/* Notification */}
      <Snackbar
        open={updateStatus.success}
        autoHideDuration={4000}
        onClose={() => setUpdateStatus(prev => ({ ...prev, success: false }))}
        message="Room status updated successfully"
      />

      <Snackbar
        open={!!updateStatus.error}
        autoHideDuration={4000}
        onClose={() => setUpdateStatus(prev => ({ ...prev, error: null }))}
        message={updateStatus.error || 'Error updating room status'}
      />

      {/* Charts & Lists */}
      <Grid container spacing={3}>
        {/* Booking Chart */}
        <Grid item xs={12} md={8}>
          <BookingChart data={chartData} />
        </Grid>
        
        {/* Top Users */}
        <Grid item xs={12} md={4}>
          <TopUsersList users={topUsers} />
        </Grid>
        
        {/* Recent Activities */}
        <Grid item xs={12}>
          <RecentActivitiesList bookings={recentBookings} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
