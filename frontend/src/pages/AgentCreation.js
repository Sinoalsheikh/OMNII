import React, { useState, useEffect } from 'react';
import agentService from '../services/agentService';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Avatar,
  Stack,
  Chip,
  Autocomplete,
  IconButton,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Code as CodeIcon,
  Language as LanguageIcon,
  Psychology as PsychologyIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

const steps = [
  'Basic Information',
  'Personality & Communication',
  'Scripts & Responses',
  'Tasks & Workflows',
  'Integrations',
  'Review & Deploy'
];

const personalities = [
  'Professional',
  'Friendly',
  'Technical',
  'Empathetic',
  'Formal',
  'Casual',
  'Analytical',
  'Creative',
  'Strategic',
  'Supportive'
];

const roles = [
  'Customer Support Agent',
  'Sales Representative',
  'Technical Support Specialist',
  'Project Manager',
  'HR Assistant',
  'Data Analyst',
  'Marketing Specialist',
  'Business Analyst',
  'Research Assistant',
  'Executive Assistant'
];

const aiModels = [
  { label: 'GPT-4', value: 'GPT-4' },
  { label: 'Claude 2', value: 'Claude 2' },
  { label: 'BERT', value: 'BERT' },
  { label: 'Custom ML Model', value: 'Custom ML Model' },
  { label: 'Hybrid AI System', value: 'Hybrid AI System' }
];

const languages = [
  'English',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Japanese',
  'Arabic',
  'Russian',
  'Portuguese',
  'Hindi'
];

const integrations = [
  'Slack',
  'Microsoft Teams',
  'Gmail',
  'Salesforce',
  'Zendesk',
  'Jira',
  'HubSpot',
  'Trello',
  'Asana',
  'GitHub'
];

const AgentCreation = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentError, setDeploymentError] = useState(null);

  const handleDeploy = async () => {
    try {
      setIsDeploying(true);
      setDeploymentError(null);

      // Create the agent through our service
      const response = await agentService.createAgent(agentData);

      // Show success message
      alert('Agent deployed successfully!');
      
      // Optionally redirect to the agent dashboard or list
      // history.push('/agents');
    } catch (error) {
      console.error('Deployment error:', error);
      setDeploymentError(error.message);
    } finally {
      setIsDeploying(false);
    }
  };
const [agentData, setAgentData] = useState({
    name: '',
    avatar: '',
    role: '',
    description: '',
    personality: {
      trait: '',
      communicationStyle: '',
      responseStyle: ''
    },
    customization: {
      voiceTone: '',
      decisionMaking: 'balanced'
    },
    scripts: [],
    tasks: [],
    workflows: [],
    skills: [],
    communication: {
      channels: [],
      languages: []
    },
    performance: {
      responseTime: 0,
      taskCompletionRate: 0,
      customerSatisfaction: 0,
      accuracyScore: 0
    },
    integrations: [],
    aiModel: '',
    learningRate: 50,
    autonomyLevel: 50,
    communicationSkill: 50,
    problemSolving: 50
  });

  const [scriptDialog, setScriptDialog] = useState({
    open: false,
    script: { name: '', content: '', trigger: '', category: '' }
  });

  const [taskDialog, setTaskDialog] = useState({
    open: false,
    task: { 
      title: '', 
      description: '', 
      priority: 'medium',
      dueDate: null 
    }
  });

  const [workflowDialog, setWorkflowDialog] = useState({
    open: false,
    workflow: {
      name: '',
      description: '',
      triggers: [],
      actions: []
    }
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (field) => (event) => {
    setAgentData({
      ...agentData,
      [field]: event.target.value,
    });
  };

  const handleMultipleChange = (field) => (event, newValue) => {
    setAgentData({
      ...agentData,
      [field]: newValue,
    });
  };

  const handleSliderChange = (field) => (event, newValue) => {
    setAgentData({
      ...agentData,
      [field]: newValue,
    });
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Agent Name"
                value={agentData.name}
                onChange={handleInputChange('name')}
                helperText="Give your AI agent a unique and memorable name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Avatar URL"
                value={agentData.avatar}
                onChange={handleInputChange('avatar')}
                helperText="Enter URL for agent's avatar image or generate one using AI"
              />
            </Grid>
            {agentData.avatar && (
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Avatar
                  src={agentData.avatar}
                  sx={{ width: 120, height: 120, margin: '0 auto' }}
                />
                <Button
                  variant="outlined"
                  startIcon={<PsychologyIcon />}
                  sx={{ mt: 2 }}
                >
                  Generate AI Avatar
                </Button>
              </Grid>
            )}
<Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={agentData.role}
                  onChange={handleInputChange('role')}
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>AI Model</InputLabel>
                <Select
                  value={agentData.aiModel}
                  onChange={handleInputChange('aiModel')}
                >
                  {aiModels.map((model) => (
                    <MenuItem key={model.value} value={model.value}>
                      {model.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Personality Configuration
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Personality Trait</InputLabel>
                        <Select
                          value={agentData.personality.trait}
                          onChange={(e) => setAgentData({
                            ...agentData,
                            personality: { ...agentData.personality, trait: e.target.value }
                          })}
                        >
                          {personalities.map((trait) => (
                            <MenuItem key={trait} value={trait}>
                              {trait}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Communication Style</InputLabel>
                        <Select
                          value={agentData.personality.communicationStyle}
                          onChange={(e) => setAgentData({
                            ...agentData,
                            personality: { ...agentData.personality, communicationStyle: e.target.value }
                          })}
                        >
                          <MenuItem value="formal">Formal</MenuItem>
                          <MenuItem value="casual">Casual</MenuItem>
                          <MenuItem value="friendly">Friendly</MenuItem>
                          <MenuItem value="professional">Professional</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Voice Tone</InputLabel>
                        <Select
                          value={agentData.customization.voiceTone}
                          onChange={(e) => setAgentData({
                            ...agentData,
                            customization: { ...agentData.customization, voiceTone: e.target.value }
                          })}
                        >
                          <MenuItem value="empathetic">Empathetic</MenuItem>
                          <MenuItem value="authoritative">Authoritative</MenuItem>
                          <MenuItem value="supportive">Supportive</MenuItem>
                          <MenuItem value="enthusiastic">Enthusiastic</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Communication Capabilities
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Autocomplete
                        multiple
                        options={languages}
                        value={agentData.communication.languages}
                        onChange={(e, newValue) => setAgentData({
                          ...agentData,
                          communication: {
                            ...agentData.communication,
                            languages: newValue.map(lang => ({ code: lang, proficiency: 'fluent' }))
                          }
                        })}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Languages"
                            helperText="Select languages the agent can communicate in"
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              label={option.code}
                              {...getTagProps({ index })}
                              icon={<LanguageIcon />}
                            />
                          ))
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography gutterBottom>Communication Skill Level</Typography>
                      <Slider
                        value={agentData.communicationSkill}
                        onChange={handleSliderChange('communicationSkill')}
                        valueLabelDisplay="auto"
                        marks={[
                          { value: 0, label: 'Basic' },
                          { value: 50, label: 'Professional' },
                          { value: 100, label: 'Expert' },
                        ]}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Response Scripts</Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setScriptDialog({ ...scriptDialog, open: true })}
                    >
                      Add Script
                    </Button>
                  </Box>
                  
                  {agentData.scripts.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper' }}>
                      <Typography color="text.secondary">
                        No scripts added yet. Add scripts to define how your agent responds in different scenarios.
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={2}>
                      {agentData.scripts.map((script, index) => (
                        <Paper key={index} sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="subtitle1">{script.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Trigger: {script.trigger}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Category: {script.category}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => {
                                const newScripts = agentData.scripts.filter((_, i) => i !== index);
                                setAgentData({ ...agentData, scripts: newScripts });
                              }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 1,
                              p: 1,
                              bgcolor: 'background.default',
                              borderRadius: 1,
                              fontFamily: 'monospace'
                            }}
                          >
                            {script.content}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Response Configuration
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Response Style</InputLabel>
                        <Select
                          value={agentData.personality.responseStyle}
                          onChange={(e) => setAgentData({
                            ...agentData,
                            personality: { ...agentData.personality, responseStyle: e.target.value }
                          })}
                        >
                          <MenuItem value="concise">Concise</MenuItem>
                          <MenuItem value="detailed">Detailed</MenuItem>
                          <MenuItem value="conversational">Conversational</MenuItem>
                          <MenuItem value="technical">Technical</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Decision Making</InputLabel>
                        <Select
                          value={agentData.customization.decisionMaking}
                          onChange={(e) => setAgentData({
                            ...agentData,
                            customization: { ...agentData.customization, decisionMaking: e.target.value }
                          })}
                        >
                          <MenuItem value="conservative">Conservative</MenuItem>
                          <MenuItem value="balanced">Balanced</MenuItem>
                          <MenuItem value="aggressive">Aggressive</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography gutterBottom>Learning Rate</Typography>
                      <Slider
                        value={agentData.learningRate}
                        onChange={handleSliderChange('learningRate')}
                        valueLabelDisplay="auto"
                        marks={[
                          { value: 0, label: 'Conservative' },
                          { value: 50, label: 'Balanced' },
                          { value: 100, label: 'Aggressive' },
                        ]}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Task Management</Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setTaskDialog({ ...taskDialog, open: true })}
                    >
                      Add Task
                    </Button>
                  </Box>
                  
                  {agentData.tasks.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper' }}>
                      <Typography color="text.secondary">
                        No tasks assigned yet. Add tasks to define the agent's responsibilities.
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={2}>
                      {agentData.tasks.map((task, index) => (
                        <Paper key={index} sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="subtitle1">{task.title}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Priority: {task.priority}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => {
                                const newTasks = agentData.tasks.filter((_, i) => i !== index);
                                setAgentData({ ...agentData, tasks: newTasks });
                              }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Box>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {task.description}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Workflow Automation</Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setWorkflowDialog({ ...workflowDialog, open: true })}
                    >
                      Add Workflow
                    </Button>
                  </Box>

                  {agentData.workflows.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper' }}>
                      <Typography color="text.secondary">
                        No workflows configured yet. Add workflows to automate the agent's processes.
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={2}>
                      {agentData.workflows.map((workflow, index) => (
                        <Paper key={index} sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="subtitle1">{workflow.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Status: {workflow.status}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => {
                                const newWorkflows = agentData.workflows.filter((_, i) => i !== index);
                                setAgentData({ ...agentData, workflows: newWorkflows });
                              }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Box>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {workflow.description}
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Triggers: {workflow.triggers.length} | Actions: {workflow.actions.length}
                            </Typography>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Automation Settings
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography gutterBottom>Autonomy Level</Typography>
                      <Slider
                        value={agentData.autonomyLevel}
                        onChange={handleSliderChange('autonomyLevel')}
                        valueLabelDisplay="auto"
                        marks={[
                          { value: 0, label: 'Supervised' },
                          { value: 50, label: 'Semi-Autonomous' },
                          { value: 100, label: 'Fully Autonomous' },
                        ]}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography gutterBottom>Problem Solving Capability</Typography>
                      <Slider
                        value={agentData.problemSolving}
                        onChange={handleSliderChange('problemSolving')}
                        valueLabelDisplay="auto"
                        marks={[
                          { value: 0, label: 'Basic' },
                          { value: 50, label: 'Advanced' },
                          { value: 100, label: 'Expert' },
                        ]}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    External Integrations
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Autocomplete
                        multiple
                        options={integrations}
                        value={agentData.integrations}
                        onChange={handleMultipleChange('integrations')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Integrations"
                            helperText="Select tools and platforms to integrate with"
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              label={option}
                              {...getTagProps({ index })}
                              icon={<SettingsIcon />}
                            />
                          ))
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Communication Channels
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={agentData.communication.channels.some(c => c.type === 'email')}
                          onChange={(e) => {
                            const channels = e.target.checked
                              ? [...agentData.communication.channels, { type: 'email', status: 'active' }]
                              : agentData.communication.channels.filter(c => c.type !== 'email');
                            setAgentData({
                              ...agentData,
                              communication: { ...agentData.communication, channels }
                            });
                          }}
                        />
                      }
                      label="Email Communication"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={agentData.communication.channels.some(c => c.type === 'chat')}
                          onChange={(e) => {
                            const channels = e.target.checked
                              ? [...agentData.communication.channels, { type: 'chat', status: 'active' }]
                              : agentData.communication.channels.filter(c => c.type !== 'chat');
                            setAgentData({
                              ...agentData,
                              communication: { ...agentData.communication, channels }
                            });
                          }}
                        />
                      }
                      label="Live Chat"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={agentData.communication.channels.some(c => c.type === 'voice')}
                          onChange={(e) => {
                            const channels = e.target.checked
                              ? [...agentData.communication.channels, { type: 'voice', status: 'active' }]
                              : agentData.communication.channels.filter(c => c.type !== 'voice');
                            setAgentData({
                              ...agentData,
                              communication: { ...agentData.communication, channels }
                            });
                          }}
                        />
                      }
                      label="Voice Communication"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    API Configuration
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Webhook URL"
                      placeholder="https://api.example.com/webhook"
                      helperText="Enter the webhook URL for external notifications"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={agentData.customization.webhookEnabled}
                          onChange={(e) => setAgentData({
                            ...agentData,
                            customization: { ...agentData.customization, webhookEnabled: e.target.checked }
                          })}
                        />
                      }
                      label="Enable Webhook Notifications"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

case 5:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Agent Summary
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={3}>
                        <Box>
                          <Typography variant="subtitle2" color="primary">Basic Information</Typography>
                          <Typography variant="body2">
                            Name: {agentData.name}
                            <br />
                            Role: {agentData.role}
                            <br />
                            AI Model: {agentData.aiModel}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="primary">Personality</Typography>
                          <Typography variant="body2">
                            Trait: {agentData.personality.trait}
                            <br />
                            Communication Style: {agentData.personality.communicationStyle}
                            <br />
                            Response Style: {agentData.personality.responseStyle}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="primary">Capabilities</Typography>
                          <Typography variant="body2">
                            Languages: {agentData.communication.languages.map(l => l.code).join(', ')}
                            <br />
                            Communication Channels: {agentData.communication.channels.map(c => c.type).join(', ')}
                            <br />
                            Scripts: {agentData.scripts.length} configured
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={3}>
                        <Box>
                          <Typography variant="subtitle2" color="primary">Tasks & Workflows</Typography>
                          <Typography variant="body2">
                            Tasks: {agentData.tasks.length} assigned
                            <br />
                            Workflows: {agentData.workflows.length} configured
                            <br />
                            Integrations: {agentData.integrations.join(', ')}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="primary">Performance Settings</Typography>
                          <Typography variant="body2">
                            Learning Rate: {agentData.learningRate}%
                            <br />
                            Autonomy Level: {agentData.autonomyLevel}%
                            <br />
                            Problem Solving: {agentData.problemSolving}%
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Deployment Options
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={agentData.deployment?.autoStart || false}
                            onChange={(e) => setAgentData({
                              ...agentData,
                              deployment: { ...agentData.deployment, autoStart: e.target.checked }
                            })}
                          />
                        }
                        label="Auto-start agent after deployment"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={agentData.deployment?.monitoring || false}
                            onChange={(e) => setAgentData({
                              ...agentData,
                              deployment: { ...agentData.deployment, monitoring: e.target.checked }
                            })}
                          />
                        }
                        label="Enable performance monitoring"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={agentData.deployment?.logging || false}
                            onChange={(e) => setAgentData({
                              ...agentData,
                              deployment: { ...agentData.deployment, logging: e.target.checked }
                            })}
                          />
                        }
                        label="Enable detailed logging"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

const handleScriptSubmit = () => {
    if (scriptDialog.script.name && scriptDialog.script.content) {
      setAgentData({
        ...agentData,
        scripts: [...agentData.scripts, scriptDialog.script]
      });
      setScriptDialog({
        open: false,
        script: { name: '', content: '', trigger: '', category: '' }
      });
    }
  };

  const handleTaskSubmit = () => {
    if (taskDialog.task.title && taskDialog.task.description) {
      setAgentData({
        ...agentData,
        tasks: [...agentData.tasks, taskDialog.task]
      });
      setTaskDialog({
        open: false,
        task: { title: '', description: '', priority: 'medium', dueDate: null }
      });
    }
  };

  const handleWorkflowSubmit = () => {
    if (workflowDialog.workflow.name && workflowDialog.workflow.description) {
      setAgentData({
        ...agentData,
        workflows: [...agentData.workflows, workflowDialog.workflow]
      });
      setWorkflowDialog({
        open: false,
        workflow: { name: '', description: '', triggers: [], actions: [] }
      });
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create AI Agent
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Design and configure your AI agent with advanced capabilities, personality traits, and workflow automation.
      </Typography>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

{getStepContent(activeStep)}

          {deploymentError && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {deploymentError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Button
variant="contained"
              onClick={activeStep === steps.length - 1 ? handleDeploy : handleNext}
            >
              {activeStep === steps.length - 1 ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isDeploying ? (
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                  ) : null}
                  Deploy Agent
                </Box>
              ) : 'Next'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Script Dialog */}
      <Dialog
        open={scriptDialog.open}
        onClose={() => setScriptDialog({ ...scriptDialog, open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Response Script</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Script Name"
              value={scriptDialog.script.name}
              onChange={(e) => setScriptDialog({
                ...scriptDialog,
                script: { ...scriptDialog.script, name: e.target.value }
              })}
            />
            <TextField
              fullWidth
              label="Trigger Event"
              value={scriptDialog.script.trigger}
              onChange={(e) => setScriptDialog({
                ...scriptDialog,
                script: { ...scriptDialog.script, trigger: e.target.value }
              })}
              helperText="When should this script be triggered?"
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={scriptDialog.script.category}
                onChange={(e) => setScriptDialog({
                  ...scriptDialog,
                  script: { ...scriptDialog.script, category: e.target.value }
                })}
              >
                <MenuItem value="greeting">Greeting</MenuItem>
                <MenuItem value="support">Support</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="followup">Follow-up</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Script Content"
              value={scriptDialog.script.content}
              onChange={(e) => setScriptDialog({
                ...scriptDialog,
                script: { ...scriptDialog.script, content: e.target.value }
              })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScriptDialog({ ...scriptDialog, open: false })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleScriptSubmit}>
            Add Script
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Dialog */}
      <Dialog
        open={taskDialog.open}
        onClose={() => setTaskDialog({ ...taskDialog, open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Task</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Task Title"
              value={taskDialog.task.title}
              onChange={(e) => setTaskDialog({
                ...taskDialog,
                task: { ...taskDialog.task, title: e.target.value }
              })}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Task Description"
              value={taskDialog.task.description}
              onChange={(e) => setTaskDialog({
                ...taskDialog,
                task: { ...taskDialog.task, description: e.target.value }
              })}
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={taskDialog.task.priority}
                onChange={(e) => setTaskDialog({
                  ...taskDialog,
                  task: { ...taskDialog.task, priority: e.target.value }
                })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="datetime-local"
              label="Due Date"
              InputLabelProps={{ shrink: true }}
              value={taskDialog.task.dueDate}
              onChange={(e) => setTaskDialog({
                ...taskDialog,
                task: { ...taskDialog.task, dueDate: e.target.value }
              })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialog({ ...taskDialog, open: false })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleTaskSubmit}>
            Add Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Workflow Dialog */}
      <Dialog
        open={workflowDialog.open}
        onClose={() => setWorkflowDialog({ ...workflowDialog, open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Workflow</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Workflow Name"
              value={workflowDialog.workflow.name}
              onChange={(e) => setWorkflowDialog({
                ...workflowDialog,
                workflow: { ...workflowDialog.workflow, name: e.target.value }
              })}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Workflow Description"
              value={workflowDialog.workflow.description}
              onChange={(e) => setWorkflowDialog({
                ...workflowDialog,
                workflow: { ...workflowDialog.workflow, description: e.target.value }
              })}
            />
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Triggers
              </Typography>
              <Stack spacing={2}>
                {workflowDialog.workflow.triggers.map((trigger, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">{trigger.event}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const newTriggers = workflowDialog.workflow.triggers.filter((_, i) => i !== index);
                        setWorkflowDialog({
                          ...workflowDialog,
                          workflow: { ...workflowDialog.workflow, triggers: newTriggers }
                        });
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setWorkflowDialog({
                      ...workflowDialog,
                      workflow: {
                        ...workflowDialog.workflow,
                        triggers: [...workflowDialog.workflow.triggers, { event: 'New Event', conditions: {} }]
                      }
                    });
                  }}
                >
                  Add Trigger
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkflowDialog({ ...workflowDialog, open: false })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleWorkflowSubmit}>
            Add Workflow
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentCreation;
