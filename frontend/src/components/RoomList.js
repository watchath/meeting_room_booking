import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Card, 
  CardContent,
  Box,
  Chip,
  Paper,
  Grid,
  Button
} from '@mui/material';
import { 
  MeetingRoom as MeetingRoomIcon,
  Check as CheckIcon
} from '@mui/icons-material';

const RoomList = ({ 
  rooms = [], 
  onSelectRoom = null, 
  selectable = false,
  loading = false,
  error = null
}) => {
  // ถ้ามีการส่ง rooms มาโดยตรงใช้ค่าที่ส่งมา ไม่ต้องโหลดจาก API

  if (loading) {
    return <Typography>กำลังโหลดข้อมูลห้อง...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (rooms.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">ไม่พบห้องประชุมที่ว่าง</Typography>
      </Paper>
    );
  }

  // แสดงห้องในรูปแบบการ์ด
  if (selectable) {
    return (
      <Grid container spacing={2}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} key={room._id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={() => onSelectRoom && onSelectRoom(room)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{room.name}</Typography>
                  <Chip 
                    label={room.status} 
                    color={room.status === 'available' ? 'success' : 'primary'} 
                    size="small" 
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  สถานที่: {room.location}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ความจุ: {room.capacity} คน
                </Typography>
                
                {room.amenities?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      สิ่งอำนวยความสะดวก:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {room.amenities.map((amenity, index) => (
                        <Chip key={index} label={amenity} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  startIcon={<CheckIcon />}
                >
                  เลือกห้องนี้
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  // แสดงในรูปแบบลิสต์ (แบบเดิม)
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>ห้องประชุมทั้งหมด</Typography>
        <List>
          {rooms.map((room) => (
            <ListItem 
              key={room._id} 
              divider
              button={!!onSelectRoom} 
              onClick={() => onSelectRoom && onSelectRoom(room)}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <ListItemText 
                    primary={room.name}
                    secondary={`ความจุ: ${room.capacity} คน | สถานที่: ${room.location}`}
                  />
                  <Chip 
                    label={room.status} 
                    color={room.status === 'available' ? 'success' : room.status === 'maintenance' ? 'error' : 'warning'} 
                    size="small" 
                  />
                </Box>
                {room.amenities?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      สิ่งอำนวยความสะดวก:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {room.amenities.map((amenity, index) => (
                        <Chip key={index} label={amenity} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RoomList;