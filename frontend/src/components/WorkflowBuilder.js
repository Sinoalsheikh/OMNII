import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Divider,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  PlayArrow as PlayIcon,
  ContentCopy as CloneIcon,
  Code as CodeIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import workflowService from '../services/workflowService';

const WorkflowBuilder = ({ workflowId, onSave }) => {
  const [workflow, setWorkflow] = useState({
    name: '',
    description: '',
    category: '',
    triggers: [],
    actions: [],
    status: 'draft'
  });

  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTriggerDialog, setShowTriggerDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCodeView, setShowCodeView] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow();
    }
    loadTemplates();
  }, [workflowId]);

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      const { workflow: loadedWorkflow } = await workflowService.getWorkflowById(workflowId);
      setWorkflow(loadedWorkflow);
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const templates = await workflowService.getWorkflowTemplates();
      setTemplates(templates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setErrors([]);
      setWarnings([]);

      // Validate workflow data
      const validation = workflowService.validateWorkflowData(workflow);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // Save workflow
      const result = workflowId
        ? await workflowService.updateWorkflow(workflowId, workflow)
        : await workflowService.createWorkflow(workflow);

      if (result.warnings) {
        setWarnings(result.warnings);
      }

      if (onSave) {
        onSave(result.workflow);
      }
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;
    const items = type === 'trigger' ? [...workflow.triggers] : [...workflow.actions];

    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    setWorkflow(prev => ({
      ...prev,
      [type === 'trigger' ? 'triggers' : 'actions']: items
    }));
  };

  const handleAddTrigger = (trigger) => {
    setWorkflow(prev => ({
      ...prev,
      triggers: [...prev.triggers, trigger]
    }));
    setShowTriggerDialog(false);
  };

  const handleAddAction = (action) => {
    setWorkflow(prev => ({
      ...prev,
      actions: [...prev.actions, action]
    }));
    setShowActionDialog(false);
  };

  const handleRemoveItem = (type, index) => {
    setWorkflow(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleEditItem = (type, index) => {
    setSelectedItem({ type, index, data: workflow[type][index] });
    if (type === 'triggers') {
      setShowTriggerDialog(true);
    } else {
      setShowActionDialog(true);
    }
  };

  const handleUpdateItem = (type, index, updatedData) => {
    setWorkflow(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? updatedData : item)
    }));
    setSelectedItem(null);
    setShowTriggerDialog(false);
    setShowActionDialog(false);
  };

  const handleApplyTemplate = async (template) => {
    setWorkflow(prev => ({
      ...prev,
      ...template,
      name: `${template.name} Copy`,
      status: 'draft'
    }));
    setShowTemplateDialog(false);
  };

  const renderDraggableList = (type, items) => (
    <Droppable droppableId={type} type={type}>
      {(provided) => (
        <Box
          ref={provided.innerRef}
          {...provided.droppableProps}
          sx={{ minHeight: 100 }}
        >
          {items.map((item, index) => (
            <Draggable
              key={`${type}-${index}`}
              draggableId={`${type}-${index}`}
              index={index}
            >
              {(provided) => (
                <Card
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  sx={{ mb: 1 }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        {type === 'triggers' ? item.event : item.type}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton
                        size="small"
                        onClick={() => handleEditItem(type, index)}
                      >
                        <SettingsIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveItem(type, index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    {Object.entries(type === 'triggers' ? item.conditions || {} : item.parameters?.entries() || {}).map(([key, value]) => (
                      <Chip
                        key={key}
                        label={`${key}: ${value}`}
                        size="small"
                        sx={{ mr: 0.5, mt: 0.5 }}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </Box>
      )}
    </Droppable>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            {workflowId ? 'Edit Workflow' : 'Create Workflow'}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            startIcon={<TimelineIcon />}
            onClick={() => setShowTemplateDialog(true)}
            sx={{ mr: 1 }}
          >
            Templates
          </Button>
          <Button
            variant="outlined"
            startIcon={<CodeIcon />}
            onClick={() => setShowCodeView(!showCodeView)}
            sx={{ mr: 1 }}
          >
            {showCodeView ? 'Visual Editor' : 'Code View'}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            Save
          </Button>
        </Box>

        {/* Errors and Warnings */}
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </Alert>
        )}
        {warnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {warnings.map((warning, index) => (
              <div key={index}>{warning}</div>
            ))}
          </Alert>
        )}

        {/* Basic Info */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Workflow Name"
              value={workflow.name}
              onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={workflow.category}
                onChange={(e) => setWorkflow(prev => ({ ...prev, category: e.target.value }))}
                label="Category"
              >
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
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              value={workflow.description}
              onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
            />
          </Grid>
        </Grid>

        {showCodeView ? (
          <TextField
            fullWidth
            multiline
            rows={20}
            value={JSON.stringify(workflow, null, 2)}
            onChange={(e) => {
              try {
                setWorkflow(JSON.parse(e.target.value));
                setErrors([]);
              } catch (error) {
                setErrors(['Invalid JSON format']);
              }
            }}
          />
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            {/* Triggers Section */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Triggers</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setShowTriggerDialog(true)}
                >
                  Add Trigger
                </Button>
              </Box>
              {renderDraggableList('triggers', workflow.triggers)}
            </Box>

            {/* Actions Section */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Actions</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setShowActionDialog(true)}
                >
                  Add Action
                </Button>
              </Box>
              {renderDraggableList('actions', workflow.actions)}
            </Box>
          </DragDropContext>
        )}
      </Paper>

      {/* Dialogs */}
      <TriggerDialog
        open={showTriggerDialog}
        onClose={() => {
          setShowTriggerDialog(false);
          setSelectedItem(null);
        }}
        onSave={selectedItem 
          ? (data) => handleUpdateItem('triggers', selectedItem.index, data)
          : handleAddTrigger
        }
        initialData={selectedItem?.data}
      />

      <ActionDialog
        open={showActionDialog}
        onClose={() => {
          setShowActionDialog(false);
          setSelectedItem(null);
        }}
        onSave={selectedItem
          ? (data) => handleUpdateItem('actions', selectedItem.index, data)
          : handleAddAction
        }
        initialData={selectedItem?.data}
      />

      <TemplateDialog
        open={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        templates={templates}
        onApply={handleApplyTemplate}
      />
    </Box>
  );
};

// Trigger Dialog Component
const TriggerDialog = ({ open, onClose, onSave, initialData }) => {
  const [trigger, setTrigger] = useState(initialData || {
    event: '',
    conditions: {},
    schedule: { cronExpression: '', timezone: 'UTC' }
  });

  useEffect(() => {
    if (initialData) {
      setTrigger(initialData);
    }
  }, [initialData]);

  const handleSave = () => {
    onSave(trigger);
    setTrigger({
      event: '',
      conditions: {},
      schedule: { cronExpression: '', timezone: 'UTC' }
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Edit Trigger' : 'Add Trigger'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Event Type</InputLabel>
            <Select
              value={trigger.event}
              onChange={(e) => setTrigger(prev => ({ ...prev, event: e.target.value }))}
              label="Event Type"
            >
              <MenuItem value="message_received">Message Received</MenuItem>
              <MenuItem value="task_completed">Task Completed</MenuItem>
              <MenuItem value="schedule_time">Schedule Time</MenuItem>
              <MenuItem value="customer_action">Customer Action</MenuItem>
              <MenuItem value="data_threshold">Data Threshold</MenuItem>
              <MenuItem value="api_webhook">API Webhook</MenuItem>
            </Select>
          </FormControl>

          {trigger.event === 'schedule_time' && (
            <>
              <TextField
                fullWidth
                label="Cron Expression"
                value={trigger.schedule?.cronExpression || ''}
                onChange={(e) => setTrigger(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, cronExpression: e.target.value }
                }))}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={trigger.schedule?.timezone || 'UTC'}
                  onChange={(e) => setTrigger(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, timezone: e.target.value }
                  }))}
                  label="Timezone"
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="America/New_York">Eastern Time</MenuItem>
                  <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                  {/* Add more timezone options */}
                </Select>
              </FormControl>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {initialData ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Action Dialog Component
const ActionDialog = ({ open, onClose, onSave, initialData }) => {
  const [action, setAction] = useState(initialData || {
    type: '',
    parameters: new Map()
  });

  useEffect(() => {
    if (initialData) {
      setAction(initialData);
    }
  }, [initialData]);

  const handleSave = () => {
    onSave(action);
    setAction({
      type: '',
      parameters: new Map()
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Edit Action' : 'Add Action'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Action Type</InputLabel>
            <Select
              value={action.type}
              onChange={(e) => setAction(prev => ({ ...prev, type: e.target.value }))}
              label="Action Type"
            >
              <MenuItem value="send_message">Send Message</MenuItem>
              <MenuItem value="create_task">Create Task</MenuItem>
              <MenuItem value="update_data">Update Data</MenuItem>
              <MenuItem value="notify_user">Notify User</MenuItem>
              <MenuItem value="api_call">API Call</MenuItem>
              <MenuItem value="assign_agent">Assign Agent</MenuItem>
              <MenuItem value="escalate_issue">Escalate Issue</MenuItem>
              <MenuItem value="generate_report">Generate Report</MenuItem>
            </Select>
          </FormControl>

          {/* Render different parameter fields based on action type */}
          {action.type === 'send_message' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Message"
              value={action.parameters?.get('message') || ''}
              onChange={(e) => setAction(prev => ({
                ...prev,
                parameters: new Map(prev.parameters).set('message', e.target.value)
              }))}
            />
          )}

          {action.type === 'api_call' && (
            <TextField
              fullWidth
              label="API URL"
              value={action.parameters?.get('url') || ''}
              onChange={(e) => setAction(prev => ({
                ...prev,
                parameters: new Map(prev.parameters).set('url', e.target.value)
              }))}
            />
          )}

          {/* Add more parameter fields for other action types */}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {initialData ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Template Dialog Component
const TemplateDialog = ({ open, onClose, templates, onApply }) => {
  const [selectedCategory, setSelectedCategory] = useState('');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Workflow Templates</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="customer_support">Customer Support</MenuItem>
            <MenuItem value="sales">Sales</MenuItem>
            <MenuItem value="marketing">Marketing</MenuItem>
            {/* Add more categories */}
          </Select>
        </FormControl>

        <Grid container spacing={2}>
          {Object.entries(templates)
            .filter(([category]) => !selectedCategory || category === selectedCategory)
            .map(([category, categoryTemplates]) => (
              <React.Fragment key={category}>
                {categoryTemplates.map((template, index) => (
                  <Grid item xs={12} md={6} key={`${category}-${index}`}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {template.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {template.description}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="contained"
                            onClick={() => onApply(template)}
                          >
                            Use Template
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </React.Fragment>
            ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkflowBuilder;
