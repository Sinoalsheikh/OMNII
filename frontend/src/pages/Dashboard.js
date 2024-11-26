import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Button,
  Chip,
  Stack,
  LinearProgress,
  Divider,
  Paper,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Psychology as PsychologyIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Group as GroupIcon,
  Insights as InsightsIcon,
  AutoGraph as AutoGraphIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock data for demonstration
const mockAgents = [
  {
    id: 1,
    name: 'Customer Support AI',
    avatar: 'https://example.com/avatar1.jpg',
    role: 'Customer Support Agent',
    status: 'Active',
    personality: {
      trait: 'Empathetic',
      communicationStyle: 'Friendly',
      responseStyle: 'Detailed'
    },
    performance: {
      overall: 92,
      responseTime: 15,
      taskCompletionRate: 95,
      customerSatisfaction: 4.8
    },
    tasks: {
      completed: 150,
      active: 8,
      upcoming: 5
    },
    communication: {
      channels: ['email', 'chat', 'voice'],
      activeChats: 5,
      languages: ['English', 'Spanish']
    },
    workflows: {
      active: 3,
      automated: true
    }
  },
  {
    id: 2,
    name: 'Sales Assistant',
    avatar: 'https://example.com/avatar2.jpg',
    role: 'Sales Representative',
    status: 'Training',
    personality: {
      trait: 'Professional',
      communicationStyle: 'Persuasive',
      responseStyle: 'Concise'
    },
    performance: {
      overall: 85,
      responseTime: 20,
      taskCompletionRate: 88,
      customerSatisfaction: 4.5
    },
    tasks: {
      completed: 75,
      active: 12,
      upcoming: 8
    },
    communication: {
      channels: ['email', 'chat'],
      activeDeals: 12,
      languages: ['English', 'French']
    },
    workflows: {
      active: 4,
      automated: true
    }
  },
  {
    id: 3,
    name: 'Technical Support Bot',
    avatar: 'https://example.com/avatar3.jpg',
    role: 'Technical Support Specialist',
    status: 'Active',
    personality: {
      trait: 'Technical',
      communicationStyle: 'Professional',
      responseStyle: 'Detailed'
    },
    performance: {
      overall: 88,
      responseTime: 12,
      taskCompletionRate: 92,
      customerSatisfaction: 4.6
    },
    tasks: {
      completed: 120,
      active: 6,
      upcoming: 4
    },
    communication: {
      channels: ['chat', 'email'],
      ticketsResolved: 45,
      languages: ['English', 'German']
    },
    workflows: {
      active: 5,
      automated: true
    }
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const handleMenuOpen = (event, agent) => {
    setAnchorEl(event.currentTarget);
    setSelectedAgent(agent);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAgent(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Training':
        return 'warning';
      case 'Inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/create-agent')}
        >
          Create New Agent
        </Button>
      </Box>

{/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <GroupIcon />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Agents
                  </Typography>
                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography variant="h5">
                      {mockAgents.filter(a => a.status === 'Active').length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      /{mockAgents.length} total
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <SpeedIcon />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    System Performance
                  </Typography>
                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography variant="h5">
                      {Math.round(mockAgents.reduce((acc, agent) => acc + agent.performance.overall, 0) / mockAgents.length)}%
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      +2.5%
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TimelineIcon />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Tasks
                  </Typography>
                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography variant="h5">
                      {mockAgents.reduce((acc, agent) => acc + agent.tasks.active, 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {mockAgents.reduce((acc, agent) => acc + agent.tasks.upcoming, 0)} upcoming
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <InsightsIcon />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Workflows
                  </Typography>
                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography variant="h5">
                      {mockAgents.reduce((acc, agent) => acc + agent.workflows.active, 0)}
                    </Typography>
                    <Typography variant="caption" color="info.main">
                      {mockAgents.filter(a => a.workflows.automated).length} automated
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Agents Section */}
      <Typography variant="h5" sx={{ mb: 3 }}>
        AI Agents
      </Typography>
      <Grid container spacing={3}>
        {mockAgents.map((agent) => (
          <Grid item xs={12} md={6} lg={4} key={agent.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={agent.avatar}
                      sx={{ width: 56, height: 56 }}
                    >
                      <PsychologyIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{agent.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {agent.role}
                      </Typography>
                    </Box>
                  </Stack>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, agent)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

<Stack spacing={2}>
                  {/* Performance Section */}
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Performance Metrics
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={agent.performance.overall}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2">
                        {agent.performance.overall}%
                      </Typography>
                    </Box>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Response Time: {agent.performance.responseTime}s
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Satisfaction: {agent.performance.customerSatisfaction}/5
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Personality & Communication */}
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Traits & Communication
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                      <Chip
                        label={agent.personality.trait}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={agent.personality.communicationStyle}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {agent.communication.channels.map((channel) => (
                        <Chip
                          key={channel}
                          label={channel}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Tasks & Status */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={agent.status}
                        color={getStatusColor(agent.status)}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        Tasks: {agent.tasks.completed}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        Active: {agent.tasks.active}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Upcoming: {agent.tasks.upcoming}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Workflows: {agent.workflows.active}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Agent Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Edit Configuration
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          View Analytics
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Manage Workflows
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          Deactivate
        </MenuItem>
      </Menu>

      {/* Recent Activity Section */}
      <Typography variant="h5" sx={{ mt: 4, mb: 3 }}>
        Recent Activity
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          {[1, 2, 3].map((item) => (
            <Box
              key={item}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <AutoGraphIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="body2">
                    Agent completed {item * 5} tasks
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    2 hours ago
                  </Typography>
                </Box>
              </Stack>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default Dashboard;
