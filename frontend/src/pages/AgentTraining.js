import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Alert,
  Tabs,
  Tab,
  Paper,
  Divider,
  Button,
  CircularProgress
} from '@mui/material';
import { NavigateNext, Psychology, History, ArrowBack } from '@mui/icons-material';
import AITraining from '../components/AITraining';
import TrainingHistory from '../components/TrainingHistory';
import agentService from '../services/agentService';

const AgentTraining = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAgentDetails();
  }, [agentId]);

  const fetchAgentDetails = async () => {
    try {
      const response = await agentService.getAgents();
      const agentData = response.find(a => a._id === agentId);
      
      if (!agentData) {
        throw new Error('Agent not found');
      }
      
      setAgent(agentData);
    } catch (err) {
      setError('Failed to load agent details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs 
        separator={<NavigateNext fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          Dashboard
        </Link>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/agents');
          }}
        >
          Agents
        </Link>
        <Typography color="text.primary">
          Training - {agent?.name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            Agent Training
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Enhance {agent?.name}'s capabilities through custom training and fine-tuning
        </Typography>
      </Box>

      {/* Agent Info Summary */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Agent Details
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Name
            </Typography>
            <Typography>{agent?.name}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Role
            </Typography>
            <Typography>{agent?.role}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              AI Model
            </Typography>
            <Typography>{agent?.aiModel?.type || 'Default'}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<Psychology />} 
            label="Training" 
            iconPosition="start"
          />
          <Tab 
            icon={<History />} 
            label="History" 
            iconPosition="start"
          />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <AITraining agentId={agentId} />
          )}
          {activeTab === 1 && (
            <TrainingHistory agentId={agentId} />
          )}
        </Box>
      </Paper>

      {/* Training Guidelines */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Training Guidelines
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Best Practices
            </Typography>
            <ul>
              <li>Provide diverse training examples</li>
              <li>Include both common and edge cases</li>
              <li>Maintain consistent response formats</li>
              <li>Test thoroughly after training</li>
            </ul>
          </Box>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Training Data Format
            </Typography>
            <Typography variant="body2">
              Training data should be in JSON format with input/output pairs:
            </Typography>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify([
                {
                  "input": "User question/prompt",
                  "output": "Desired response"
                }
              ], null, 2)}
            </pre>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AgentTraining;
