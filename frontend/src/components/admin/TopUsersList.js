import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Divider,
  Chip
} from '@mui/material';
import { 
  EmojiEvents as TrophyIcon, 
  Person as PersonIcon 
} from '@mui/icons-material';

const TopUsersList = ({ users }) => {
  // ถ้าไม่มีข้อมูล แสดงข้อความแจ้งเตือน
  if (!users || users.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No user booking data available.
        </Typography>
      </Paper>
    );
  }

  // ฟังก์ชันสำหรับดึงอักษรย่อจากชื่อผู้ใช้
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  // ฟังก์ชันสำหรับกำหนดสีของ avatar ตาม ranking
  const getRankColor = (index) => {
    switch (index) {
      case 0:
        return 'gold';
      case 1:
        return 'silver';
      case 2:
        return '#cd7f32'; // bronze
      default:
        return 'grey';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TrophyIcon color="warning" sx={{ mr: 1 }} />
        <Typography variant="h6">
          Top Users by Bookings
        </Typography>
      </Box>
      <List>
        {users.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Divider variant="inset" component="li" />}
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getRankColor(index) }}>
                  {getInitials(item.user.username)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={item.user.username}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {item.user.email}
                    </Typography>
                    {item.user.department && (
                      <Typography component="span" display="block" variant="body2">
                        {item.user.department}
                      </Typography>
                    )}
                  </>
                }
              />
              <Chip 
                label={`${item.bookingCount} bookings`} 
                color="primary"
                variant="outlined"
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default TopUsersList;