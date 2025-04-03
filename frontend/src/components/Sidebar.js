import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Collapse,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Book as BookIcon,
  Person as PersonIcon,
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
  MeetingRoom as MeetingRoomIcon,
  People as PeopleIcon,
  SupervisorAccount as AdminIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';
import { useEffect } from 'react';

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [adminOpen, setAdminOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  
  const isAdmin = currentUser?.role === 'admin';

  // ดึงจำนวนการจองที่รอการอนุมัติสำหรับ admin
  useEffect(() => {
    if (isAdmin) {
      const fetchPendingBookings = async () => {
        try {
          const bookings = await bookingService.getAllBookings();
          const pending = bookings.filter(b => b.status === 'pending').length;
          setPendingCount(pending);
        } catch (error) {
          console.error('Error fetching pending bookings:', error);
        }
      };
      
      fetchPendingBookings();
    }
  }, [isAdmin]);

  const handleAdminToggle = () => {
    setAdminOpen(!adminOpen);
  };
  
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard'
    },
    {
      text: 'Book Room',
      icon: <BookIcon />,
      path: '/book-room'
    },
    {
      text: 'My Bookings',
      icon: <EventIcon />,
      path: '/my-bookings'
    },
    {
      text: 'Profile',
      icon: <PersonIcon />,
      path: '/profile'
    }
  ];
  
  const adminMenuItems = [
    {
      text: 'Admin Dashboard',
      icon: <AdminIcon />,
      path: '/admin'
    },
    {
      text: 'Manage Rooms',
      icon: <MeetingRoomIcon />,
      path: '/admin/rooms'
    },
    {
      text: 'Manage Bookings',
      icon: <EventNoteIcon />,
      path: '/admin/bookings',
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'warning'
    },
    {
      text: 'Manage Users',
      icon: <PeopleIcon />,
      path: '/admin/users'
    }
  ];
  
  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };
  
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 270,
          bgcolor: 'background.default',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
            Meeting Room Booking
            {isAdmin && (
              <Badge 
                color="error" 
                variant="dot" 
                sx={{ ml: 1 }} 
                invisible={pendingCount === 0}
              >
                <AdminIcon fontSize="small" color="primary" />
              </Badge>
            )}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <List component="nav" sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text}
              onClick={() => handleNavigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                }}
              />
            </ListItem>
          ))}
          
          {isAdmin && (
            <>
              <Divider sx={{ my: 2 }} />
              
              <ListItem 
                button 
                onClick={handleAdminToggle}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: location.pathname.startsWith('/admin') ? 'error.light' : 'inherit',
                  color: location.pathname.startsWith('/admin') ? 'white' : 'inherit',
                  '&:hover': {
                    bgcolor: location.pathname.startsWith('/admin') ? 'error.light' : 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: location.pathname.startsWith('/admin') ? 'white' : 'error.main' 
                }}>
                  <AdminIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Admin Panel"
                  primaryTypographyProps={{
                    fontWeight: location.pathname.startsWith('/admin') ? 'bold' : 'normal'
                  }}
                />
                {pendingCount > 0 && (
                  <Badge 
                    badgeContent={pendingCount} 
                    color="warning"
                    sx={{ mr: 1 }}
                  />
                )}
                {adminOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              
              <Collapse in={adminOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {adminMenuItems.map((item) => (
                    <ListItem 
                      button 
                      key={item.text}
                      onClick={() => handleNavigate(item.path)}
                      selected={location.pathname === item.path}
                      sx={{ 
                        pl: 4,
                        borderRadius: 1,
                        ml: 2,
                        mr: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          bgcolor: 'error.light',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'error.light',
                          }
                        }
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: location.pathname === item.path ? 'white' : 'inherit' 
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                        }}
                      />
                      {item.badge && (
                        <Badge 
                          badgeContent={item.badge} 
                          color={item.badgeColor || 'primary'}
                        />
                      )}
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          )}
        </List>
        
        <Box>
          <Typography variant="caption" color="text.secondary">
            Meeting Room Booking System v1.0
          </Typography>
          {isAdmin && (
            <Typography variant="caption" color="error" display="block">
              Administrator Mode
            </Typography>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
