import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Badge
} from '@mui/material';
import { 
  Person as PersonIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  EventNote as EventNoteIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isAdmin = currentUser?.role === 'admin';

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleDashboard = () => {
    navigate('/dashboard');
    handleClose();
  };

  const handleMyBookings = () => {
    navigate('/my-bookings');
    handleClose();
  };

  const handleAdmin = () => {
    navigate('/admin');
    handleClose();
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {isAuthenticated && (
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="menu"
            onClick={toggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/"
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          Meeting Room Booking
          {isAdmin && (
            <Badge 
              color="secondary" 
              variant="dot" 
              sx={{ ml: 1 }}
            >
              <AdminIcon fontSize="small" />
            </Badge>
          )}
        </Typography>
        
        {isAuthenticated ? (
          <Box>
            {!isMobile && (
              <Button 
                color="inherit" 
                onClick={() => navigate('/book-room')}
                sx={{ mr: 1 }}
              >
                Book Room
              </Button>
            )}
            
            <IconButton 
              onClick={handleMenu}
              color="inherit"
              sx={{ 
                ml: 1,
                border: currentUser ? '2px solid white' : 'none',
                bgcolor: isAdmin ? 'error.main' : 'transparent'
              }}
            >
              {currentUser ? (
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: isAdmin ? 'white' : 'primary.main',
                    color: isAdmin ? 'error.main' : 'white'
                  }}
                >
                  {getInitials(currentUser.username)}
                </Avatar>
              ) : (
                <PersonIcon />
              )}
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                elevation: 3,
                sx: { 
                  minWidth: 200,
                  mt: 1
                }
              }}
            >
              {currentUser && (
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle1" noWrap>
                    {currentUser.username}
                    {isAdmin && (
                      <Badge 
                        color="error" 
                        variant="dot"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {currentUser.email}
                  </Typography>
                  {isAdmin && (
                    <Typography variant="caption" color="error" fontWeight="bold">
                      Administrator
                    </Typography>
                  )}
                </Box>
              )}
              
              <Divider />
              
              <MenuItem onClick={handleDashboard}>
                <ListItemIcon>
                  <DashboardIcon fontSize="small" />
                </ListItemIcon>
                Dashboard
              </MenuItem>
              
              <MenuItem onClick={handleMyBookings}>
                <ListItemIcon>
                  <EventNoteIcon fontSize="small" />
                </ListItemIcon>
                My Bookings
              </MenuItem>
              
              <MenuItem onClick={handleProfile}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              
              {isAdmin && (
                <MenuItem onClick={handleAdmin}>
                  <ListItemIcon>
                    <AdminIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  Admin Panel
                </MenuItem>
              )}
              
              <Divider />
              
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/login"
              sx={{ mr: 1 }}
            >
              Login
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              component={RouterLink} 
              to="/register"
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;