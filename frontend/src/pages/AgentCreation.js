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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Snackbar
} from '@mui/material';
import agentService from '../services/agentService';

const AgentCreation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    personality: {
      trait: 'Professional',
      communicationStyle: 'Technical',
      responseStyle: 'Detailed'
    },
    customization: {
      voiceTone: 'Professional',
      decisionMaking: 'balanced'
    }
  });
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setWarning(null);
    setLoading(true);

    try {
      console.log('Creating agent:', formData);
      const response = await agentService.createAgent(formData);
      console.log('Agent creation response:', response);

      // Check for warnings about limited functionality
      if (response.warning) {
        setWarning(response.warning);
        setShowSnackbar(true);
      }

      // Navigate to dashboard even with warnings
      navigate('/');
    } catch (error) {
      console.error('Error creating agent:', error);
      setError(error.response?.data?.error || 'Failed to create agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom>
            Create New AI Agent
          </Typography>

          {warning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {warning.message}
              {warning.details && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {warning.details.reason}
                </Typography>
              )}
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Agent Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  helperText="e.g., Sales Assistant, Customer Support, Technical Advisor"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Personality Trait</InputLabel>
                  <Select
                    name="personality.trait"
                    value={formData.personality.trait}
                    onChange={handleChange}
                    label="Personality Trait"
                  >
                    <MenuItem value="Professional">Professional</MenuItem>
                    <MenuItem value="Friendly">Friendly</MenuItem>
                    <MenuItem value="Technical">Technical</MenuItem>
                    <MenuItem value="Casual">Casual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Communication Style</InputLabel>
                  <Select
                    name="personality.communicationStyle"
                    value={formData.personality.communicationStyle}
                    onChange={handleChange}
                    label="Communication Style"
                  >
                    <MenuItem value="Technical">Technical</MenuItem>
                    <MenuItem value="Conversational">Conversational</MenuItem>
                    <MenuItem value="Direct">Direct</MenuItem>
                    <MenuItem value="Detailed">Detailed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Voice Tone</InputLabel>
                  <Select
                    name="customization.voiceTone"
                    value={formData.customization.voiceTone}
                    onChange={handleChange}
                    label="Voice Tone"
                  >
                    <MenuItem value="Professional">Professional</MenuItem>
                    <MenuItem value="Casual">Casual</MenuItem>
                    <MenuItem value="Enthusiastic">Enthusiastic</MenuItem>
                    <MenuItem value="Empathetic">Empathetic</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Decision Making</InputLabel>
                  <Select
                    name="customization.decisionMaking"
                    value={formData.customization.decisionMaking}
                    onChange={handleChange}
                    label="Decision Making"
                  >
                    <MenuItem value="balanced">Balanced</MenuItem>
                    <MenuItem value="cautious">Cautious</MenuItem>
                    <MenuItem value="decisive">Decisive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Creating Agent...' : 'Create Agent'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        message="Agent created with limited AI functionality"
      />
    </Box>
  );
};

export default AgentCreation;
