import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ChatInterface from '../components/ChatInterface';
import VoiceCall from '../components/VoiceCall';
import agentService from '../services/agentService';

const Chat = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await agentService.getAgents();
        const foundAgent = response.find(a => a._id === agentId);
        if (foundAgent) {
          setAgent(foundAgent);
        } else {
          setError('Agent not found');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error fetching agent');
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [agentId, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!agent) {
    return null;
  }

  const isSalesAgent = agent.role?.toLowerCase().includes('sales');

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <SmartToyIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h1">
              {agent.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {agent.role}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {agent.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={`Personality: ${agent.personality?.trait || 'Professional'}`}
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={`Communication: ${agent.personality?.communicationStyle || 'Clear'}`}
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={`Voice: ${agent.customization?.voiceTone || 'Professional'}`}
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>

        {agent.limitations && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {agent.limitations.message}
            {agent.limitations.reason && (
              <Typography variant="caption" display="block">
                Reason: {agent.limitations.reason}
              </Typography>
            )}
          </Alert>
        )}

        {isSalesAgent && (
          <>
            <VoiceCall agent={agent} />
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>

      <ChatInterface agent={agent} />
    </Container>
  );
};

export default Chat;
