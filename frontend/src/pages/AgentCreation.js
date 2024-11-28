import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Snackbar,
  FormGroup,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import agentService from '../services/agentService';

const AgentCreation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    personality: {
      trait: 'Professional',
      communicationStyle: 'Technical',
      responseStyle: 'Detailed'
    },
    customization: {
      voiceTone: 'Professional',
      decisionMaking: 'balanced'
    },
    aiModel: {
      type: 'gpt-4',
      capabilities: [
        {
          name: 'conversation',
          description: 'Natural language conversation capabilities',
          enabled: true,
          parameters: {}
        },
        {
          name: 'task_execution',
          description: 'Ability to execute defined tasks and workflows',
          enabled: true,
          parameters: {}
        }
      ],
      knowledgeBase: [
        {
          name: 'General Knowledge',
          description: 'Basic information and common responses',
          content: '',
          category: 'general'
        }
      ],
      trainingData: [],
      customization: {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1
      }
    },
    skills: [{
      name: 'Communication',
      proficiency: 80,
      description: 'Effective communication skills',
      category: 'soft'
    }],
    communication: {
      channels: [{
        type: 'chat',
        status: 'active',
        preferences: {
          responseTime: 30,
          autoReply: {
            enabled: true,
            message: ''
          },
          workingHours: {
            enabled: false,
            schedule: []
          }
        }
      }],
      languages: [{
        code: 'en',
        proficiency: 'fluent'
      }]
    },
  });
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [skillToRemove, setSkillToRemove] = useState(null);

  const validateFormData = (data) => {
    const errors = [];

    // Required fields
    if (!data.name.trim()) errors.push('Agent name is required');
    if (!data.role.trim()) errors.push('Role is required');
    
    // AI Model validation
    if (!data.aiModel.type) errors.push('AI model type is required');
    if (!data.aiModel.capabilities.length) errors.push('At least one AI capability is required');
    
    // Knowledge Base validation
    if (!data.aiModel.knowledgeBase.length) {
      errors.push('At least one knowledge base entry is required');
    } else {
      data.aiModel.knowledgeBase.forEach((kb, index) => {
        if (!kb.name.trim()) errors.push(`Knowledge base ${index + 1} name is required`);
        if (!kb.category.trim()) errors.push(`Knowledge base ${index + 1} category is required`);
      });
    }

    // Skills validation
    if (!data.skills.length) {
      errors.push('At least one skill is required');
    } else {
      data.skills.forEach((skill, index) => {
        if (!skill.name.trim()) errors.push(`Skill ${index + 1} name is required`);
        if (!skill.category) errors.push(`Skill ${index + 1} category is required`);
        if (skill.proficiency < 0 || skill.proficiency > 100) {
          errors.push(`Skill ${index + 1} proficiency must be between 0 and 100`);
        }
      });
    }

    // Communication channels validation
    if (!data.communication.channels.length) {
      errors.push('At least one communication channel must be enabled');
    }

    // AI model validation
    const { temperature, maxTokens } = data.aiModel.customization;
    if (temperature < 0 || temperature > 2) {
      errors.push('Temperature must be between 0 and 2');
    }
    if (maxTokens < 100 || maxTokens > 4000) {
      errors.push('Max tokens must be between 100 and 4000');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setWarning(null);

    // Validate form data
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    setLoading(true);

    try {
      console.log('Creating agent:', formData);
      const response = await agentService.createAgent(formData);
      console.log('Agent creation response:', response);

      // Set warning if present
      if (response.warning) {
        setWarning(response.warning);
        // Show warning message first
        setSnackbar({
          open: true,
          message: 'Agent created with limited AI functionality',
          severity: 'warning'
        });
        // Show success message after warning
        setTimeout(() => {
          setSnackbar({
            open: true,
            message: 'Agent created successfully',
            severity: 'success'
          });
          // Navigate after success message
          setTimeout(() => navigate('/'), 1500);
        }, 1500);
      } else {
        // Show success message immediately if no warning
        setSnackbar({
          open: true,
          message: 'Agent created successfully',
          severity: 'success'
        });
        // Navigate after success message
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        setError(error.response.data.errors.join('\n'));
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to create agent. Please try again.');
      }

      // Show error in snackbar
      setSnackbar({
        open: true,
        message: 'Failed to create agent',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle array updates (e.g., skills[0].name)
    if (name.includes('[')) {
      try {
        const [arrayName, indexStr, field] = name.match(/([^\[]+)\[(\d+)\]\.(.+)/).slice(1);
        const index = parseInt(indexStr);
        
        if (isNaN(index)) {
          console.error('Invalid array index in field name:', name);
          return;
        }
        
        setFormData(prev => {
          const array = prev[arrayName];
          if (!Array.isArray(array)) {
            console.error('Field is not an array:', arrayName);
            return prev;
          }
          
          if (index < 0 || index >= array.length) {
            console.error('Array index out of bounds:', index);
            return prev;
          }
          
          return {
            ...prev,
            [arrayName]: array.map((item, i) => 
              i === index ? { ...item, [field]: value } : item
            )
          };
        });
        return;
      } catch (error) {
        console.error('Error parsing array field name:', name, error);
        return;
      }
    }
    
    // Handle nested object updates (e.g., personality.trait)
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      if (subChild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subChild]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          name: '',
          proficiency: 50,
          description: '',
          category: 'technical'
        }
      ]
    }));
  };

  const handleRemoveSkill = (index) => {
    setSkillToRemove(index);
  };

  const [removingSkill, setRemovingSkill] = useState(false);

  const confirmRemoveSkill = async () => {
    if (skillToRemove !== null) {
      setRemovingSkill(true);
      try {
        const skillName = formData.skills[skillToRemove].name;
        setFormData(prev => ({
          ...prev,
          skills: prev.skills.filter((_, i) => i !== skillToRemove)
        }));
        setSnackbar({
          open: true,
          message: `Skill "${skillName || 'Untitled'}" has been removed`,
          severity: 'success'
        });
      } finally {
        setRemovingSkill(false);
        setSkillToRemove(null);
      }
    }
  };

  const cancelRemoveSkill = () => {
    setSkillToRemove(null);
  };

  const handleCapabilityToggle = (index, enabled) => {
    setFormData(prev => ({
      ...prev,
      aiModel: {
        ...prev.aiModel,
        capabilities: prev.aiModel.capabilities.map((cap, i) => 
          i === index ? { ...cap, enabled } : cap
        )
      }
    }));
  };

  const handleAddCapability = () => {
    setFormData(prev => ({
      ...prev,
      aiModel: {
        ...prev.aiModel,
        capabilities: [
          ...prev.aiModel.capabilities,
          {
            name: '',
            description: '',
            enabled: true,
            parameters: {}
          }
        ]
      }
    }));
  };

  const handleRemoveCapability = (index) => {
    setFormData(prev => ({
      ...prev,
      aiModel: {
        ...prev.aiModel,
        capabilities: prev.aiModel.capabilities.filter((_, i) => i !== index)
      }
    }));
  };

  const handleRemoveKnowledgeBase = (index) => {
    setFormData(prev => ({
      ...prev,
      aiModel: {
        ...prev.aiModel,
        knowledgeBase: prev.aiModel.knowledgeBase.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddKnowledgeBase = () => {
    setFormData(prev => ({
      ...prev,
      aiModel: {
        ...prev.aiModel,
        knowledgeBase: [
          ...prev.aiModel.knowledgeBase,
          {
            name: '',
            description: '',
            content: '',
            category: 'general'
          }
        ]
      }
    }));
  };

  const handleChannelToggle = (channelType, enabled) => {
    setFormData(prev => ({
      ...prev,
      communication: {
        ...prev.communication,
        channels: enabled 
          ? [...prev.communication.channels, {
              type: channelType,
              status: 'active',
              preferences: {
                responseTime: 30,
                autoReply: {
                  enabled: true,
                  message: `Hello! I'm ${prev.name}, your ${prev.role}. How can I assist you today?`
                },
                workingHours: {
                  enabled: false,
                  schedule: []
                }
              }
            }]
          : prev.communication.channels.filter(c => c.type !== channelType)
      }
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom>
            Create New AI Agent
          </Typography>

          {warning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {warning.message}
              {warning.details && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {warning.details.reason}
                </Typography>
              )}
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.split('\n').map((line, index) => (
                <Typography key={index} variant="body2">
                  • {line}
                </Typography>
              ))}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Agent Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  helperText="Choose a unique name for your AI agent"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  helperText="e.g., Sales Assistant, Customer Support, Technical Advisor"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  helperText="Describe the agent's purpose and capabilities"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Personality & Communication
                </Typography>
              </Grid>


              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Personality Trait</InputLabel>
                  <Select
                    name="personality.trait"
                    value={formData.personality.trait}
                    onChange={handleChange}
                    label="Personality Trait"
                  >
                    <MenuItem value="Professional">Professional</MenuItem>
                    <MenuItem value="Friendly">Friendly</MenuItem>
                    <MenuItem value="Technical">Technical</MenuItem>
                    <MenuItem value="Casual">Casual</MenuItem>
                    <MenuItem value="Empathetic">Empathetic</MenuItem>
                    <MenuItem value="Analytical">Analytical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Communication Style</InputLabel>
                  <Select
                    name="personality.communicationStyle"
                    value={formData.personality.communicationStyle}
                    onChange={handleChange}
                    label="Communication Style"
                  >
                    <MenuItem value="Technical">Technical</MenuItem>
                    <MenuItem value="Conversational">Conversational</MenuItem>
                    <MenuItem value="Direct">Direct</MenuItem>
                    <MenuItem value="Detailed">Detailed</MenuItem>
                    <MenuItem value="Simplified">Simplified</MenuItem>
                    <MenuItem value="Adaptive">Adaptive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Voice Tone</InputLabel>
                  <Select
                    name="customization.voiceTone"
                    value={formData.customization.voiceTone}
                    onChange={handleChange}
                    label="Voice Tone"
                  >
                    <MenuItem value="Professional">Professional</MenuItem>
                    <MenuItem value="Casual">Casual</MenuItem>
                    <MenuItem value="Enthusiastic">Enthusiastic</MenuItem>
                    <MenuItem value="Empathetic">Empathetic</MenuItem>
                    <MenuItem value="Authoritative">Authoritative</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  AI Model Configuration
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>AI Model</InputLabel>
                  <Select
                    name="aiModel.type"
                    value={formData.aiModel.type}
                    onChange={handleChange}
                    label="AI Model"
                  >
                    <MenuItem value="gpt-4">GPT-4 (Most Capable)</MenuItem>
                    <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Balanced)</MenuItem>
                    <MenuItem value="gpt-4-turbo">GPT-4 Turbo (Latest)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  AI Capabilities
                </Typography>
                {formData.aiModel.capabilities.map((capability, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Capability Name"
                          name={`aiModel.capabilities[${index}].name`}
                          value={capability.name}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Description"
                          name={`aiModel.capabilities[${index}].description`}
                          value={capability.description}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={capability.enabled}
                              onChange={(e) => handleCapabilityToggle(index, e.target.checked)}
                            />
                          }
                          label="Enabled"
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        {index > 1 && (
                          <Button
                            color="error"
                            onClick={() => handleRemoveCapability(index)}
                            size="small"
                          >
                            Remove
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  onClick={handleAddCapability}
                  startIcon={<AddIcon />}
                  sx={{ mt: 1 }}
                >
                  Add Capability
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Knowledge Base
                </Typography>
                {formData.aiModel.knowledgeBase.map((kb, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Knowledge Base Name"
                          name={`aiModel.knowledgeBase[${index}].name`}
                          value={kb.name}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Category"
                          name={`aiModel.knowledgeBase[${index}].category`}
                          value={kb.category}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          name={`aiModel.knowledgeBase[${index}].description`}
                          value={kb.description}
                          onChange={handleChange}
                          multiline
                          rows={2}
                        />
                      </Grid>
                      <Grid item xs={12} md={11}>
                        <TextField
                          fullWidth
                          label="Content"
                          name={`aiModel.knowledgeBase[${index}].content`}
                          value={kb.content}
                          onChange={handleChange}
                          multiline
                          rows={4}
                          helperText="Enter knowledge base content in markdown format"
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        {index > 0 && (
                          <Button
                            color="error"
                            onClick={() => handleRemoveKnowledgeBase(index)}
                            size="small"
                          >
                            Remove
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  onClick={handleAddKnowledgeBase}
                  startIcon={<AddIcon />}
                  sx={{ mt: 1 }}
                >
                  Add Knowledge Base Entry
                </Button>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Temperature"
                  name="aiModel.customization.temperature"
                  value={formData.aiModel.customization.temperature}
                  onChange={handleChange}
                  inputProps={{ min: 0, max: 2, step: 0.1 }}
                  helperText="Controls randomness (0-2)"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Tokens"
                  name="aiModel.customization.maxTokens"
                  value={formData.aiModel.customization.maxTokens}
                  onChange={handleChange}
                  inputProps={{ min: 100, max: 4000, step: 100 }}
                  helperText="Maximum response length"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Communication Channels
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormGroup row>
                  {['chat', 'email', 'voice', 'video', 'sms'].map((channel) => (
                    <FormControlLabel
                      key={channel}
                      control={
                        <Switch
                          checked={formData.communication.channels.some(c => c.type === channel)}
                          onChange={(e) => handleChannelToggle(channel, e.target.checked)}
                        />
                      }
                      label={channel.charAt(0).toUpperCase() + channel.slice(1)}
                    />
                  ))}
                </FormGroup>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Decision Making</InputLabel>
                  <Select
                    name="customization.decisionMaking"
                    value={formData.customization.decisionMaking}
                    onChange={handleChange}
                    label="Decision Making"
                  >
                    <MenuItem value="balanced">Balanced</MenuItem>
                    <MenuItem value="cautious">Cautious</MenuItem>
                    <MenuItem value="decisive">Decisive</MenuItem>
                    <MenuItem value="adaptive">Adaptive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Skills & Expertise
                </Typography>
              </Grid>

              {formData.skills.map((skill, index) => (
                <React.Fragment key={index}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1">Skill {index + 1}</Typography>
                      {index > 0 && (
                        <Button
                          color="error"
                          onClick={() => handleRemoveSkill(index)}
                          size="small"
                        >
                          Remove Skill
                        </Button>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Skill Category</InputLabel>
                      <Select
                        name={`skills[${index}].category`}
                        value={skill.category}
                        onChange={handleChange}
                        label="Skill Category"
                      >
                        <MenuItem value="technical">Technical</MenuItem>
                        <MenuItem value="soft">Soft Skills</MenuItem>
                        <MenuItem value="domain">Domain Knowledge</MenuItem>
                        <MenuItem value="language">Language</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Skill Name"
                      name={`skills[${index}].name`}
                      value={skill.name}
                      onChange={handleChange}
                      helperText="e.g., Customer Service, Technical Support, Sales"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Proficiency"
                      name={`skills[${index}].proficiency`}
                      value={skill.proficiency}
                      onChange={handleChange}
                      inputProps={{ min: 0, max: 100, step: 5 }}
                      helperText="Skill level (0-100)"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Skill Description"
                      name={`skills[${index}].description`}
                      value={skill.description}
                      onChange={handleChange}
                      multiline
                      rows={2}
                      helperText="Brief description of the skill"
                    />
                  </Grid>
                </React.Fragment>
              ))}

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  onClick={handleAddSkill}
                  startIcon={<AddIcon />}
                  sx={{ mt: 1 }}
                >
                  Add Another Skill
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Creating Agent...' : 'Create Agent'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={skillToRemove !== null}
        onClose={cancelRemoveSkill}
        aria-labelledby="remove-skill-dialog"
      >
        <DialogTitle id="remove-skill-dialog">
          Remove Skill
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this skill? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelRemoveSkill}>Cancel</Button>
          <Button 
            onClick={confirmRemoveSkill} 
            color="error" 
            variant="contained"
            disabled={removingSkill}
          >
            {removingSkill ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentCreation;
