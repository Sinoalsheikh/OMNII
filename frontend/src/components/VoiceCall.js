import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import CallEndIcon from '@mui/icons-material/CallEnd';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const VoiceCall = ({ agent, customer }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(customer?.personalInfo?.phone || '');
  const [callStatus, setCallStatus] = useState(null);
  const [activeCallId, setActiveCallId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Poll call status when there's an active call
  useEffect(() => {
    let statusInterval;
    if (activeCallId) {
      statusInterval = setInterval(async () => {
        try {
          const response = await axios.get(`${API_URL}/api/voice/status/${activeCallId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          setCallStatus(response.data.status);

          // Stop polling if call is completed or failed
          if (['completed', 'failed', 'busy', 'no-answer'].includes(response.data.status)) {
            clearInterval(statusInterval);
            setActiveCallId(null);
          }
        } catch (error) {
          console.error('Error fetching call status:', error);
        }
      }, 5000);
    }

    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [activeCallId]);

  const handleStartCall = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/voice/call`,
        {
          agentId: agent._id,
          customerId: customer?.customerId,
          phoneNumber
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setActiveCallId(response.data.callId);
      setCallStatus(response.data.status);
      setIsDialogOpen(false);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to initiate call');
    } finally {
      setLoading(false);
    }
  };

  const handleEndCall = async () => {
    if (!activeCallId) return;

    setLoading(true);
    setError(null);

    try {
      await axios.post(
        `${API_URL}/api/voice/end`,
        { callId: activeCallId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setActiveCallId(null);
      setCallStatus('completed');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to end call');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {callStatus && (
          <Alert 
            severity={
              callStatus === 'completed' ? 'success' :
              callStatus === 'in-progress' ? 'info' :
              ['failed', 'busy', 'no-answer'].includes(callStatus) ? 'error' :
              'info'
            }
            sx={{ mb: 2 }}
          >
            Call Status: {callStatus}
          </Alert>
        )}

        <Button
          variant="contained"
          color={activeCallId ? 'error' : 'primary'}
          startIcon={activeCallId ? <CallEndIcon /> : <PhoneIcon />}
          onClick={activeCallId ? handleEndCall : () => setIsDialogOpen(true)}
          disabled={loading}
          sx={{ width: '100%' }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : activeCallId ? (
            'End Call'
          ) : (
            'Start Voice Call'
          )}
        </Button>
      </Box>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Start Voice Call</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            helperText="Enter phone number in international format"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleStartCall}
            variant="contained"
            disabled={!phoneNumber.trim() || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Start Call'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VoiceCall;
