import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

// Mock data for demonstration
const performanceData = [
  {
    agent: 'Customer Support Agent 1',
    tasks: 156,
    success: 92,
    response: '1.5m',
    satisfaction: 4.8,
  },
  {
    agent: 'Sales Representative 1',
    tasks: 89,
    success: 88,
    response: '2.1m',
    satisfaction: 4.6,
  },
  {
    agent: 'Technical Support 1',
    tasks: 134,
    success: 95,
    response: '3.2m',
    satisfaction: 4.9,
  },
  {
    agent: 'Project Manager 1',
    tasks: 67,
    success: 91,
    response: '4.5m',
    satisfaction: 4.7,
  },
];

function TabPanel({ children, value, index }) {
  return (
    <Box hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  );
}

const Analytics = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('week');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Analytics Dashboard</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select value={timeRange} onChange={handleTimeRangeChange} label="Time Range">
            <MenuItem value="day">Last 24 Hours</MenuItem>
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
            <MenuItem value="quarter">Last Quarter</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Agent Performance" />
          <Tab label="Task Analytics" />
          <Tab label="Customer Satisfaction" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overall Performance
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    Performance chart coming soon...
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Task Distribution
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    Distribution chart coming soon...
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Agent</TableCell>
                <TableCell align="right">Tasks Completed</TableCell>
                <TableCell align="right">Success Rate (%)</TableCell>
                <TableCell align="right">Avg Response Time</TableCell>
                <TableCell align="right">Satisfaction Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performanceData.map((row) => (
                <TableRow key={row.agent}>
                  <TableCell component="th" scope="row">
                    {row.agent}
                  </TableCell>
                  <TableCell align="right">{row.tasks}</TableCell>
                  <TableCell align="right">{row.success}%</TableCell>
                  <TableCell align="right">{row.response}</TableCell>
                  <TableCell align="right">{row.satisfaction}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Task Completion Trends
                </Typography>
                <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    Task trends chart coming soon...
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Satisfaction Score
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    CSAT chart coming soon...
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Feedback Analysis
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    Feedback analysis chart coming soon...
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default Analytics;
