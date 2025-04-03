import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Link,
  Alert,
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
import { isValidUsername } from '../utils/validators';

const LoginForm = () => {
  const [error, setError] = useState('');
  const [showPassword, { toggle: toggleShowPassword }] = useBoolean(false);
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  // Validate login form
  const validateLogin = (values) => {
    const errors = {};
    
    if (!values.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!values.password) {
      errors.password = 'Password is required';
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
    password: ''
  }, validateLogin);

  const onSubmit = async (formData) => {
    setError('');
    
    try {
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate className="fade-in">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Username"
        name="username"
        autoComplete="username"
        autoFocus
        value={values.username}
        onChange={handleChange}
        error={!!errors.username}
        helperText={errors.username}
        disabled={loading}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="current-password"
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
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
        className="card-hover"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
      
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Link component={RouterLink} to="/register" variant="body2">
          {"Don't have an account? Sign Up"}
        </Link>
      </Box>
    </Box>
  );
};

export default LoginForm;
