import React, { useState } from 'react';
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
} from '@mui/material';

const steps = ['Basic Information', 'Personality & Skills', 'Role Configuration', 'Review'];

const personalities = [
  'Professional',
  'Friendly',
  'Technical',
  'Empathetic',
  'Formal',
  'Casual',
];

const roles = [
  'Customer Support',
  'Sales Representative',
  'Technical Support',
  'Project Manager',
  'HR Assistant',
  'Data Analyst',
];

const AgentCreation = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [agentData, setAgentData] = useState({
    name: '',
    avatar: '',
    personality: '',
    role: '',
    skills: [],
    efficiency: 50,
    autonomy: 50,
    communication: 50,
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
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Avatar URL"
                value={agentData.avatar}
                onChange={handleInputChange('avatar')}
                helperText="Enter URL for agent's avatar image"
              />
            </Grid>
            {agentData.avatar && (
              <Grid item xs={12}>
                <Avatar
                  src={agentData.avatar}
                  sx={{ width: 100, height: 100, margin: '0 auto' }}
                />
              </Grid>
            )}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Personality Type</InputLabel>
                <Select
                  value={agentData.personality}
                  onChange={handleInputChange('personality')}
                >
                  {personalities.map((personality) => (
                    <MenuItem key={personality} value={personality}>
                      {personality}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>Efficiency Level</Typography>
              <Slider
                value={agentData.efficiency}
                onChange={handleSliderChange('efficiency')}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>Communication Skills</Typography>
              <Slider
                value={agentData.communication}
                onChange={handleSliderChange('communication')}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
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
              <Typography gutterBottom>Autonomy Level</Typography>
              <Slider
                value={agentData.autonomy}
                onChange={handleSliderChange('autonomy')}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Agent Summary
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2">Name</Typography>
                  <Typography>{agentData.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Role</Typography>
                  <Typography>{agentData.role}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Personality</Typography>
                  <Typography>{agentData.personality}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Metrics</Typography>
                  <Typography>
                    Efficiency: {agentData.efficiency}%
                    <br />
                    Communication: {agentData.communication}%
                    <br />
                    Autonomy: {agentData.autonomy}%
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create New Agent
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Configure your virtual agent's personality, skills, and role.
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
              onClick={activeStep === steps.length - 1 ? () => {} : handleNext}
            >
              {activeStep === steps.length - 1 ? 'Create Agent' : 'Next'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AgentCreation;
