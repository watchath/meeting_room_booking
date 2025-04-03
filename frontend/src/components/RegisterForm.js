import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Link,
  Alert,
  Grid,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from '../hooks/useForm';
import { useBoolean } from '../hooks/useBoolean';
import { isValidEmail, isValidPassword, isValidUsername } from '../utils/validators';

const RegisterForm = () => {
  const [formError, setFormError] = useState('');
  const [showPassword, { toggle: toggleShowPassword }] = useBoolean(false);
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  // Form validation function
  const validateRegister = (values) => {
    const errors = {};
    
    // Username validation
    if (!values.username.trim()) {
      errors.username = 'Username is required';
    } else if (!isValidUsername(values.username)) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    // Email validation
    if (!values.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (!isValidPassword(values.password)) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  // Initialize form with custom hook
  const { 
    values, 
    errors, 
    handleChange, 
    handleSubmit 
  } = useForm({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: ''
  }, validateRegister);

  const onSubmit = async (formData) => {
    setFormError('');
    
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        department: formData.department
      });
      
      // Show success and navigate to login
      navigate('/login');
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate className="fade-in">
      {formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={values.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={values.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="department"
            label="Department"
            id="department"
            value={values.department}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
      </Grid>
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
        className="card-hover"
      >
        {loading ? 'Signing Up...' : 'Sign Up'}
      </Button>
      
      <Box sx={{ textAlign: 'center' }}>
        <Link component={RouterLink} to="/login" variant="body2">
          Already have an account? Sign in
        </Link>
      </Box>
    </Box>
  );
};

export default RegisterForm;
