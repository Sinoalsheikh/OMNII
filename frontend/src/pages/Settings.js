import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Switch,
  Button,
  Stack,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Alert,
  IconButton,
  Collapse,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Security as SecurityIcon,
  Api as ApiIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

const Settings = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [settings, setSettings] = useState({
    aiModel: 'gpt-4',
    language: 'en',
    timezone: 'UTC',
    autoSave: true,
    notifications: true,
    dataRetention: '30',
    apiKey: '****************************************',
    maxAgents: '10',
    debugMode: false,
  });

  const [integrations] = useState([
    { name: 'Slack', status: 'Connected', lastSync: '2 hours ago' },
    { name: 'Microsoft Teams', status: 'Connected', lastSync: '1 hour ago' },
    { name: 'Salesforce', status: 'Disconnected', lastSync: 'Never' },
    { name: 'Zendesk', status: 'Connected', lastSync: '30 minutes ago' },
  ]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleSettingChange = (setting) => (event) => {
    setSettings({
      ...settings,
      [setting]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    });
  };

  const handleSave = () => {
    setShowAlert(true);
    // Implement save functionality
  };

  const renderGeneralSettings = () => (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            AI Configuration
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>AI Model</InputLabel>
                <Select
                  value={settings.aiModel}
                  label="AI Model"
                  onChange={handleSettingChange('aiModel')}
                >
                  <MenuItem value="gpt-4">GPT-4</MenuItem>
                  <MenuItem value="gpt-3.5">GPT-3.5</MenuItem>
                  <MenuItem value="claude">Claude</MenuItem>
                  <MenuItem value="custom">Custom Model</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language}
                  label="Language"
                  onChange={handleSettingChange('language')}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Data Retention</InputLabel>
                <Select
                  value={settings.dataRetention}
                  label="Data Retention"
                  onChange={handleSettingChange('dataRetention')}
                >
                  <MenuItem value="7">7 days</MenuItem>
                  <MenuItem value="30">30 days</MenuItem>
                  <MenuItem value="90">90 days</MenuItem>
                  <MenuItem value="365">1 year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Max Concurrent Agents</InputLabel>
                <Select
                  value={settings.maxAgents}
                  label="Max Concurrent Agents"
                  onChange={handleSettingChange('maxAgents')}
                >
                  <MenuItem value="5">5 agents</MenuItem>
                  <MenuItem value="10">10 agents</MenuItem>
                  <MenuItem value="20">20 agents</MenuItem>
                  <MenuItem value="unlimited">Unlimited</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Preferences
          </Typography>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoSave}
                  onChange={handleSettingChange('autoSave')}
                />
              }
              label="Auto-save changes"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications}
                  onChange={handleSettingChange('notifications')}
                />
              }
              label="Enable notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.debugMode}
                  onChange={handleSettingChange('debugMode')}
                />
              }
              label="Debug mode"
            />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );

  const renderIntegrations = () => (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Connected Services
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="small"
        >
          Add Integration
        </Button>
      </Box>

      <List>
        {integrations.map((integration) => (
          <Paper key={integration.name} sx={{ mb: 2 }}>
            <ListItem>
              <ListItemText
                primary={integration.name}
                secondary={`Last synced: ${integration.lastSync}`}
              />
              <ListItemSecondaryAction>
                <Chip
                  label={integration.status}
                  color={integration.status === 'Connected' ? 'success' : 'error'}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                >
                  {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          </Paper>
        ))}
      </List>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            API Configuration
          </Typography>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="API Key"
              type="password"
              value={settings.apiKey}
              onChange={handleSettingChange('apiKey')}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
              >
                Generate New Key
              </Button>
              <Button
                variant="outlined"
                startIcon={<ApiIcon />}
              >
                View API Docs
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure your OmniFlow.AI platform settings and integrations
        </Typography>
      </Box>

      <Collapse in={showAlert}>
        <Alert
          severity="success"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setShowAlert(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          Settings saved successfully!
        </Alert>
      </Collapse>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="settings tabs"
        >
          <Tab icon={<SecurityIcon />} iconPosition="start" label="General" />
          <Tab icon={<ApiIcon />} iconPosition="start" label="Integrations" />
          <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notifications" />
          <Tab icon={<StorageIcon />} iconPosition="start" label="Storage" />
        </Tabs>
      </Box>

      <Box sx={{ mb: 3 }}>
        {currentTab === 0 && renderGeneralSettings()}
        {currentTab === 1 && renderIntegrations()}
        {currentTab === 2 && (
          <Typography color="text.secondary">
            Notification settings coming soon...
          </Typography>
        )}
        {currentTab === 3 && (
          <Typography color="text.secondary">
            Storage settings coming soon...
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => {
            // Reset settings
          }}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;
