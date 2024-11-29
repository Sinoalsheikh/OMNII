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
  CircularProgress
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ChatInterface from '../components/ChatInterface';
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
          setError('Chatbot not found');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error fetching chatbot');
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
            <Chip 
              label={agent.traits}
              color="primary"
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>
        
        <Typography variant="body1" sx={{ mb: 1 }}>
          {agent.purpose}
        </Typography>
      </Paper>

      <ChatInterface agent={agent} />
    </Container>
  );
};

export default Chat;
