import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Tab,
  Tabs,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';

// Mock data for charts
const mockPerformanceData = [
  { agent: 'Customer Support AI', performance: 92, tasks: 150, satisfaction: 4.5 },
  { agent: 'Sales Assistant', performance: 85, tasks: 75, satisfaction: 4.2 },
  { agent: 'Technical Support Bot', performance: 88, tasks: 120, satisfaction: 4.3 },
];

const mockTimelineData = [
  { date: '2024-01', tasks: 280, efficiency: 87 },
  { date: '2024-02', tasks: 320, efficiency: 89 },
  { date: '2024-03', tasks: 350, efficiency: 91 },
];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState('performance');

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const renderPerformanceMetrics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Agent Performance Overview</Typography>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Download Report">
                  <IconButton size="small">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share">
                  <IconButton size="small">
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
            <Box sx={{ height: 300, bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              {/* Placeholder for Chart */}
              <Typography color="text.secondary" sx={{ textAlign: 'center', pt: 10 }}>
                Performance Chart Visualization
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Metrics
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Average Performance
                  </Typography>
                  <Typography variant="h4">
                    88.3%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Tasks Completed
                  </Typography>
                  <Typography variant="h4">
                    345
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Customer Satisfaction
                  </Typography>
                  <Typography variant="h4">
                    4.3/5
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Improvement Suggestions
              </Typography>
              <Stack spacing={1}>
                <Paper sx={{ p: 1, bgcolor: 'background.paper' }}>
                  <Typography variant="body2">
                    Increase training frequency for Sales Assistant
                  </Typography>
                </Paper>
                <Paper sx={{ p: 1, bgcolor: 'background.paper' }}>
                  <Typography variant="body2">
                    Optimize response time for Technical Support
                  </Typography>
                </Paper>
                <Paper sx={{ p: 1, bgcolor: 'background.paper' }}>
                  <Typography variant="body2">
                    Enhance natural language processing
                  </Typography>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );

  const renderWorkflowAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Workflow Efficiency Timeline</Typography>
              <Button
                startIcon={<DateRangeIcon />}
                variant="outlined"
                size="small"
              >
                Select Date Range
              </Button>
            </Box>
            <Box sx={{ height: 300, bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              {/* Placeholder for Timeline Chart */}
              <Typography color="text.secondary" sx={{ textAlign: 'center', pt: 10 }}>
                Workflow Timeline Visualization
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Workflow Distribution
            </Typography>
            <Box sx={{ height: 250, bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              {/* Placeholder for Pie Chart */}
              <Typography color="text.secondary" sx={{ textAlign: 'center', pt: 10 }}>
                Workflow Distribution Chart
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Automation Impact
            </Typography>
            <Box sx={{ height: 250, bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              {/* Placeholder for Impact Chart */}
              <Typography color="text.secondary" sx={{ textAlign: 'center', pt: 10 }}>
                Automation Impact Visualization
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Analytics & Insights
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive analysis of agent performance and workflow efficiency
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
                <MenuItem value="1y">Last Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Metric</InputLabel>
              <Select
                value={selectedMetric}
                label="Metric"
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                <MenuItem value="performance">Performance</MenuItem>
                <MenuItem value="efficiency">Efficiency</MenuItem>
                <MenuItem value="satisfaction">Satisfaction</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab
            icon={<BarChartIcon />}
            iconPosition="start"
            label="Performance Metrics"
          />
          <Tab
            icon={<TimelineIcon />}
            iconPosition="start"
            label="Workflow Analytics"
          />
          <Tab
            icon={<PieChartIcon />}
            iconPosition="start"
            label="Resource Utilization"
          />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        {currentTab === 0 && renderPerformanceMetrics()}
        {currentTab === 1 && renderWorkflowAnalytics()}
        {currentTab === 2 && (
          <Typography variant="body1" color="text.secondary">
            Resource Utilization Analytics Coming Soon
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Analytics;
