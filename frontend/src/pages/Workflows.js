import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  ContentCopy as CloneIcon,
  FilterList as FilterIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import workflowService from '../services/workflowService';
import WorkflowBuilder from '../components/WorkflowBuilder';

const Workflows = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPerformanceDialog, setShowPerformanceDialog] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);

  useEffect(() => {
    loadWorkflows();
  }, [filters]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const { workflows: loadedWorkflows } = await workflowService.getWorkflows(filters);
      setWorkflows(loadedWorkflows);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = () => {
    setSelectedWorkflow(null);
    setShowBuilder(true);
  };

  const handleEditWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
    setShowBuilder(true);
  };

  const handleSaveWorkflow = async (workflow) => {
    try {
      await loadWorkflows();
      setShowBuilder(false);
      setSelectedWorkflow(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteWorkflow = async () => {
    try {
      await workflowService.deleteWorkflow(selectedWorkflow._id);
      await loadWorkflows();
      setShowDeleteDialog(false);
      setSelectedWorkflow(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleExecuteWorkflow = async (workflow) => {
    try {
      await workflowService.executeWorkflow(workflow._id);
      await loadWorkflows(); // Refresh to get updated metrics
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCloneWorkflow = async (workflow) => {
    try {
      await workflowService.cloneWorkflow(workflow._id);
      await loadWorkflows();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleViewPerformance = async (workflow) => {
    try {
      const { metrics } = await workflowService.getWorkflowPerformance(workflow._id);
      setPerformanceData(metrics);
      setShowPerformanceDialog(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const renderWorkflowCard = (workflow) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            {workflow.name}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            label={workflow.status}
            color={
              workflow.status === 'active' ? 'success' :
              workflow.status === 'draft' ? 'warning' : 'error'
            }
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {workflow.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label={workflow.category}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${workflow.triggers.length} Triggers`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${workflow.actions.length} Actions`}
            size="small"
            variant="outlined"
          />
        </Box>

        {workflow.metrics && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Performance Metrics
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Success Rate
                </Typography>
                <Typography>
                  {((workflow.metrics.successfulExecutions / workflow.metrics.totalExecutions) * 100).toFixed(1)}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Total Executions
                </Typography>
                <Typography>
                  {workflow.metrics.totalExecutions}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
        <Tooltip title="View Performance">
          <IconButton
            size="small"
            onClick={() => handleViewPerformance(workflow)}
          >
            <AssessmentIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Clone">
          <IconButton
            size="small"
            onClick={() => handleCloneWorkflow(workflow)}
          >
            <CloneIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={() => handleEditWorkflow(workflow)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setSelectedWorkflow(workflow);
              setShowDeleteDialog(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          startIcon={<PlayIcon />}
          onClick={() => handleExecuteWorkflow(workflow)}
          disabled={workflow.status !== 'active'}
        >
          Execute
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Workflows
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateWorkflow}
        >
          Create Workflow
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                label="Category"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="customer_support">Customer Support</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
                <MenuItem value="operations">Operations</MenuItem>
                <MenuItem value="hr">HR</MenuItem>
                <MenuItem value="finance">Finance</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Workflow Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {workflows.map((workflow) => (
            <Grid item xs={12} md={6} lg={4} key={workflow._id}>
              {renderWorkflowCard(workflow)}
            </Grid>
          ))}
        </Grid>
      )}

      {/* Workflow Builder Dialog */}
      <Dialog
        open={showBuilder}
        onClose={() => {
          setShowBuilder(false);
          setSelectedWorkflow(null);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <WorkflowBuilder
            workflowId={selectedWorkflow?._id}
            onSave={handleSaveWorkflow}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Delete Workflow</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedWorkflow?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteWorkflow}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Performance Dialog */}
      <Dialog
        open={showPerformanceDialog}
        onClose={() => setShowPerformanceDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Workflow Performance</DialogTitle>
        <DialogContent>
          {performanceData && (
            <Box sx={{ py: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Execution Stats
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Total Executions
                          </Typography>
                          <Typography variant="h5">
                            {performanceData.executionStats.total}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Success Rate
                          </Typography>
                          <Typography variant="h5">
                            {performanceData.executionStats.successRate.toFixed(1)}%
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Timing
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Average Execution Time
                          </Typography>
                          <Typography variant="h5">
                            {(performanceData.timing.averageExecutionTime / 1000).toFixed(2)}s
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Last Execution
                          </Typography>
                          <Typography>
                            {new Date(performanceData.timing.lastExecution).toLocaleString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recommendations
                      </Typography>
                      <Typography variant="body1">
                        {performanceData.recommendations}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPerformanceDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Workflows;
