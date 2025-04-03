import React, { useState } from 'react';
import { Card, CardContent, Typography, Avatar, List, ListItem, ListItemText,ListItemIcon,Box,Button,TextField,Grid,Divider,IconButton} from '@mui/material';
import {Email as EmailIcon,Work as WorkIcon,Edit as EditIcon,Save as SaveIcon,Cancel as CancelIcon} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { currentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [userData, setUserData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    department: currentUser?.department || ''
  });

  if (!currentUser) {
    return <Typography>Loading profile...</Typography>;
  }

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditToggle = () => {
    if (editing) {
      // Cancel editing, revert changes
      setUserData({
        username: currentUser.username,
        email: currentUser.email,
        department: currentUser.department
      });
    }
    setEditing(!editing);
  };

  const handleSave = () => {
    // In a real app, you would call an API to update the user profile
    console.log('Save user data:', userData);
    setEditing(false);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar 
            sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: 'primary.main',
              fontSize: 40,
              mb: 2
            }}
          >
            {getInitials(currentUser.username)}
          </Avatar>
          
          {editing ? (
            <Box sx={{ width: '100%', maxWidth: 300 }}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={userData.username}
                onChange={handleChange}
                margin="normal"
              />
            </Box>
          ) : (
            <Typography variant="h5">
              {currentUser.username}
            </Typography>
          )}
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              backgroundColor: currentUser.role === 'admin' ? 'error.main' : 'primary.main',
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: 10,
              mt: 1
            }}
          >
            {currentUser.role.toUpperCase()}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          {editing ? (
            <>
              <IconButton color="primary" onClick={handleSave}>
                <SaveIcon />
              </IconButton>
              <IconButton color="error" onClick={handleEditToggle}>
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            <IconButton color="primary" onClick={handleEditToggle}>
              <EditIcon />
            </IconButton>
          )}
        </Box>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <EmailIcon />
            </ListItemIcon>
            {editing ? (
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                type="email"
              />
            ) : (
              <ListItemText 
                primary="Email" 
                secondary={currentUser.email} 
              />
            )}
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <WorkIcon />
            </ListItemIcon>
            {editing ? (
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={userData.department}
                onChange={handleChange}
              />
            ) : (
              <ListItemText 
                primary="Department" 
                secondary={currentUser.department || 'Not specified'} 
              />
            )}
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default UserProfile;