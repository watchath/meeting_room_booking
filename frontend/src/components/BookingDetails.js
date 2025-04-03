import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import { 
  Event as EventIcon, 
  AccessTime as AccessTimeIcon, 
  Room as RoomIcon, 
  Person as PersonIcon 
} from '@mui/icons-material';
import { formatDate, formatTime } from '../utils/formatDate';

const BookingDetails = ({ room, startTime, endTime, purpose, onPurposeChange }) =>{
    if(!room || !startTime || !endTime){
        return <Typography>ข้อมูลการจองไม่ครบถ้วน</Typography>
    }

    return (
        <Grid container spacing={3}>
            
            <Grid item xs={12} md={6}>
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <RoomIcon sx={{ VerticalAlign: 'middle', mr: 1 }} />
                            ข้อมูลห้อง
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant='subtitle1'>
                                {room.name}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                                สถานที่: {room.location}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                                ความจุ: {room.capacity} คน
                            </Typography>
                        </Box>
                        {room.amenities && room.amenities.length > 0 && (
                            <Box>
                                <Typography variant="body2" gutterBottom>
                                    สิ่งอำนวยความสะดวก:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {room.amenities.map((amenity, index) => (
                                    <Chip key={index} label={amenity} size="small" variant="outlined" />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <EventIcon sx={{ VerticalAlign: 'middle', mr: 1 }} />
                            ข้อมูลการจอง
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <EventIcon fontSize='small' sx={{ mr: 1 }} />
                                วันที่: {formatDate(startTime)}
                            </Typography>
                            <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center' }}>
                                <EventIcon fontSize='small' sx={{ mr: 1 }} />
                                เวลา: {formatTime(startTime)} - {formatTime(endTime)}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item sx={12}>
                <Divider sx={{ my:2 }} />
                <Typography variant='h6' gutterBottom>
                    <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }}/>
                    วัตถุประสงค์การจอง
                </Typography>
                <TextField 
                    fullWidth
                    multiline
                    rows={4}
                    label='ระบุวัตถุประสงค์การจอง'
                    placeholder='เช่น ประชุมทีม, ประชุมลูกค้า, สัมมนา, ฝึกอบรม'
                    value={purpose}
                    onChange={onPurposeChange}
                    required
                />
            </Grid>
        </Grid>
    );
};

export default BookingDetails;