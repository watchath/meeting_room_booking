import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  Alert,
  Avatar
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  PersonOutlined as UserIcon
} from '@mui/icons-material';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [editDialog, setEditDialog] = useState({ open: false, userId: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null });
  const [roleDialog, setRoleDialog] = useState({ open: false, userId: null, role: '' });
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    department: '',
    role: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await userService.getAllUsers();
      setUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setUserData({
      username: user.username,
      email: user.email,
      department: user.department || '',
      role: user.role
    });
    setEditDialog({ open: true, userId: user._id });
  };

  const handleCloseEditDialog = () => {
    setEditDialog({ open: false, userId: null });
  };

  const handleDeleteUser = (userId) => {
    setDeleteDialog({ open: true, userId });
  };

  const handleChangeRole = (userId, newRole) => {
    setRoleDialog({ open: true, userId, role: newRole });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleEditSubmit = async () => {
    if (!editDialog.userId) return;

    setLoading(true);
    try {
      const updatedUser = await userService.updateUser(editDialog.userId, userData);
      
      // Update users in state
      setUsers(users.map(user => 
        user._id === editDialog.userId ? updatedUser : user
      ));
      
      setSuccess('User updated successfully');
      handleCloseEditDialog();
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.userId) return;

    setLoading(true);
    try {
      await userService.deleteUser(deleteDialog.userId);
      
      // Remove user from state
      setUsers(users.filter(user => user._id !== deleteDialog.userId));
      
      setSuccess('User deleted successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, userId: null });
    }
  };

  const handleRoleConfirm = async () => {
    if (!roleDialog.userId) return;

    setLoading(true);
    try {
      const updatedUser = await userService.updateUserRole(
        roleDialog.userId, 
        roleDialog.role
      );
      
      // Update users in state
      setUsers(users.map(user => 
        user._id === roleDialog.userId ? updatedUser : user
      ));
      
      setSuccess(`User role changed to ${roleDialog.role} successfully`);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to change user role');
    } finally {
      setLoading(false);
      setRoleDialog({ open: false, userId: null, role: '' });
    }
  };

  // Function to get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  if (loading && users.length === 0) {
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Registration Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" py={3}>
                      No users found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: user.role === 'admin' ? 'error.main' : 'primary.main',
                            width: 40,
                            height: 40,
                            mr: 2
                          }}
                        >
                          {getInitials(user.username)}
                        </Avatar>
                        {user.username}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.department || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        icon={user.role === 'admin' ? <AdminIcon /> : <UserIcon />}
                        label={user.role}
                        color={user.role === 'admin' ? 'error' : 'primary'}
                        variant={user.role === 'admin' ? 'filled' : 'outlined'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit User">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEditUser(user)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {user.role === 'user' ? (
                        <Tooltip title="Make Admin">
                          <IconButton 
                            color="error" 
                            onClick={() => handleChangeRole(user._id, 'admin')}
                          >
                            <AdminIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Make Regular User">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleChangeRole(user._id, 'user')}
                          >
                            <UserIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Delete User">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Edit User Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="username"
                label="Username"
                fullWidth
                value={userData.username}
                onChange={handleInputChange}
                disabled
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                fullWidth
                value={userData.email}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="department"
                label="Department"
                fullWidth
                value={userData.department}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={userData.role}
                  onChange={handleInputChange}
                  label="Role"
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete User Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone.
            All bookings associated with this user will also be affected.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Change Role Confirmation Dialog */}
      <Dialog
        open={roleDialog.open}
        onClose={() => setRoleDialog({ ...roleDialog, open: false })}
      >
        <DialogTitle>Confirm Role Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {roleDialog.role === 'admin' 
              ? 'Are you sure you want to make this user an administrator? Administrators have full access to manage rooms, bookings, and users.' 
              : 'Are you sure you want to change this administrator to a regular user? They will lose administrative privileges.'
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setRoleDialog({ ...roleDialog, open: false })}
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRoleConfirm} 
            color={roleDialog.role === 'admin' ? 'error' : 'primary'} 
            variant="contained"
          >
            Change Role
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageUsers;
