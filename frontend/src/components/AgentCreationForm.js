import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  Alert,
  Typography,
  Paper
} from '@mui/material';
import agentService from '../services/agentService';

const AgentCreationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    traits: 'friendly',
    purpose: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await agentService.createAgent(formData);
      navigate(`/chat/${response.agent._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create chatbot');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Name
        </Typography>
        <TextField
          fullWidth
          name="name"
          placeholder="Give your chatbot a name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
              borderRadius: 2
            }
          }}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Personality
        </Typography>
        <FormControl fullWidth>
          <Select
            name="traits"
            value={formData.traits}
            onChange={handleChange}
            required
            disabled={isLoading}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2
            }}
          >
            <MenuItem value="friendly">Friendly & Helpful</MenuItem>
            <MenuItem value="professional">Professional & Formal</MenuItem>
            <MenuItem value="casual">Casual & Relaxed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Purpose
        </Typography>
        <TextField
          fullWidth
          name="purpose"
          placeholder="What will your chatbot help with? (e.g., General assistance, Customer support)"
          value={formData.purpose}
          onChange={handleChange}
          required
          disabled={isLoading}
          multiline
          rows={3}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
              borderRadius: 2
            }
          }}
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        disabled={isLoading}
        sx={{
          mt: 4,
          py: 1.5,
          borderRadius: 2,
          fontSize: '1.1rem'
        }}
      >
        {isLoading ? 'Creating Chatbot...' : 'Create Chatbot'}
      </Button>
    </Box>
  );
};

export default AgentCreationForm;
