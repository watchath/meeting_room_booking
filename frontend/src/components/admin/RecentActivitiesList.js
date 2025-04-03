import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Box
} from '@mui/material';
import {
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Pending as PendingIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { formatDate, formatTime, formatDateTime } from '../../utils/formatDate';

const RecentActivitiesList = ({ bookings }) => {
  // ถ้าไม่มีข้อมูล แสดงข้อความแจ้งเตือน
  if (!bookings || bookings.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No recent activities.
        </Typography>
      </Paper>
    );
  }

  // ฟังก์ชันสำหรับกำหนด icon ตามสถานะการจอง
  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <EventAvailableIcon color="success" />;
      case 'cancelled':
        return <EventBusyIcon color="error" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      default:
        return <HistoryIcon />;
    }
  };

  // ฟังก์ชันสำหรับกำหนดสีของ Chip ตามสถานะการจอง
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <HistoryIcon color="info" sx={{ mr: 1 }} />
        <Typography variant="h6">
          Recent Activities
        </Typography>
      </Box>
      <List>
        {bookings.map((booking, index) => (
          <React.Fragment key={booking._id}>
            {index > 0 && <Divider component="li" />}
            <ListItem alignItems="flex-start">
              <ListItemIcon>
                {getStatusIcon(booking.status)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    color="text.primary"
                  >
                    {booking.room.name} booked by {booking.user.username}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {formatDate(booking.startTime)} {formatTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                    </Typography>
                    <br/>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      className="text-ellipsis"
                      sx={{ maxWidth: '300px' }}
                    >
                      {booking.purpose}
                    </Typography>
                  </>
                }
              />
              <Chip
                label={booking.status}
                color={getStatusColor(booking.status)}
                size="small"
                sx={{ mt: 1 }}
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default RecentActivitiesList;