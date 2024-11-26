import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, progress }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <Box>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
        <IconButton>
          <MoreVertIcon />
        </IconButton>
      </Box>
      {progress && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {progress}% increase from last month
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const stats = [
    {
      title: 'Active Agents',
      value: '12',
      icon: <PersonIcon />,
      progress: 75,
    },
    {
      title: 'Tasks Completed',
      value: '847',
      icon: <AssignmentIcon />,
      progress: 65,
    },
    {
      title: 'Customer Satisfaction',
      value: '94%',
      icon: <TimelineIcon />,
      progress: 85,
    },
    {
      title: 'Active Conversations',
      value: '234',
      icon: <ChatIcon />,
      progress: 45,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to OmniFlow.Ai
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Monitor your virtual workforce performance and analytics in real-time.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Agent Performance Overview
              </Typography>
              {/* Chart component will be added here */}
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  Performance chart coming soon...
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <Box sx={{ mt: 2 }}>
                {/* Activity list will be added here */}
                <Typography color="text.secondary">
                  Recent activities will appear here...
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
