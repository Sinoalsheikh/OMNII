import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  LinearProgress,
  Button,
  Tooltip
} from '@mui/material';
import {
  Download,
  Refresh,
  CheckCircle,
  Error,
  Pending,
  Timeline
} from '@mui/icons-material';
import trainingService from '../services/trainingService';

const TrainingHistory = ({ agentId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTraining, setActiveTraining] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await trainingService.getTrainingHistory(agentId);
      setHistory(data);
      
      // Check for active training sessions
      const active = data.find(session => 
        session.status === 'running' || session.status === 'queued'
      );
      if (active) {
        setActiveTraining(active);
        monitorActiveTraining(active.jobId);
      }
    } catch (err) {
      setError('Failed to load training history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [agentId]);

  const monitorActiveTraining = (jobId) => {
    trainingService.monitorTrainingProgress(agentId, jobId, (status) => {
      setHistory(prev => prev.map(session => 
        session.jobId === jobId 
          ? { ...session, ...status }
          : session
      ));

      if (status.status === 'completed' || status.status === 'failed') {
        setActiveTraining(null);
      }
    });
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      completed: { color: 'success', icon: <CheckCircle />, label: 'Completed' },
      running: { color: 'primary', icon: <Pending />, label: 'Running' },
      failed: { color: 'error', icon: <Error />, label: 'Failed' },
      queued: { color: 'warning', icon: <Timeline />, label: 'Queued' }
    };

    const config = statusConfig[status] || statusConfig.queued;

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleDownload = async () => {
    try {
      await trainingService.downloadTrainingHistory(agentId);
    } catch (err) {
      setError('Failed to download training history');
      console.error(err);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Training History
          </Typography>
          <Box>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchHistory} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download History">
              <IconButton onClick={handleDownload} disabled={loading}>
                <Download />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {activeTraining && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Active Training Progress
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={activeTraining.progress || 0} 
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              Job ID: {activeTraining.jobId}
            </Typography>
          </Box>
        )}

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Examples</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((session) => (
                <TableRow key={session.jobId}>
                  <TableCell>{formatDate(session.createdAt)}</TableCell>
                  <TableCell>{getStatusChip(session.status)}</TableCell>
                  <TableCell>{session.model}</TableCell>
                  <TableCell>{session.examplesCount || 'N/A'}</TableCell>
                  <TableCell>
                    {session.duration 
                      ? `${Math.round(session.duration / 60)} mins`
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <Timeline />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No training history available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default TrainingHistory;
