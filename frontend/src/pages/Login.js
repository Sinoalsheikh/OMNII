import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData);
      const { token } = response.data;
      
      // Store the token
      localStorage.setItem('token', token);
      
      // Redirect to the previous page or dashboard
      navigate(-1);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/register')}
              sx={{ mt: 1 }}
            >
              Don't have an account? Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
