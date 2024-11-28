import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AgentCard from '../components/AgentCard';
import agentService from '../services/agentService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAgents = async () => {
    try {
      const response = await agentService.getAgents();
      setAgents(response);
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreateAgent = () => {
    navigate('/create-agent');
  };

  const handleDeleteAgent = async (agentId) => {
    try {
      await agentService.deleteAgent(agentId);
      setAgents(agents.filter(agent => agent._id !== agentId));
    } catch (err) {
      setError(err.response?.data?.error || 'Error deleting agent');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          AI Agents
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateAgent}
        >
          Create New Agent
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {agents.map((agent) => (
          <Grid item xs={12} sm={6} md={4} key={agent._id}>
            <AgentCard
              agent={agent}
              onDelete={handleDeleteAgent}
            />
          </Grid>
        ))}
        {agents.length === 0 && !loading && (
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                bgcolor: 'background.paper',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No agents found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first AI agent to get started
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateAgent}
              >
                Create New Agent
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;
