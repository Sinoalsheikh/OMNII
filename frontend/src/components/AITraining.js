import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { UploadFile, Code, Psychology } from '@mui/icons-material';

const AITraining = ({ agentId }) => {
  const [trainingData, setTrainingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setTrainingData(data);
          setError(null);
        } catch (err) {
          setError('Invalid JSON format. Please check your training data file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTrainingSubmit = async () => {
    setLoading(true);
    try {
      // TODO: Implement training submission to backend
      setSuccess(true);
      setError(null);
    } catch (err) {
      setError(err.message);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          AI Training & Fine-tuning
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Training data successfully uploaded and processed
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFile />}
                disabled={loading}
              >
                Upload Training Data
                <input
                  type="file"
                  hidden
                  accept=".json"
                  onChange={handleFileUpload}
                />
              </Button>
              {trainingData && (
                <Typography variant="body2" color="success.main">
                  File loaded successfully
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Custom Instructions"
              placeholder="Add any specific instructions for training..."
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Psychology />}
                onClick={handleTrainingSubmit}
                disabled={!trainingData || loading}
              >
                {loading ? 'Training...' : 'Start Training'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Code />}
                disabled={loading}
              >
                View Training Logs
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AITraining;
