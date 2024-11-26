import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
} from '@mui/material';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: true,
    autoAssign: false,
    apiKey: '********-****-****-****-************',
    webhookUrl: 'https://api.example.com/webhook',
  });

  const [showAlert, setShowAlert] = useState(false);

  const handleToggleChange = (setting) => (event) => {
    setSettings({
      ...settings,
      [setting]: event.target.checked,
    });
  };

  const handleInputChange = (setting) => (event) => {
    setSettings({
      ...settings,
      [setting]: event.target.value,
    });
  };

  const handleSave = () => {
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Configure your OmniFlow.Ai workspace settings and preferences.
      </Typography>

      {showAlert && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                General Settings
              </Typography>
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications}
                      onChange={handleToggleChange('notifications')}
                    />
                  }
                  label="Enable Notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                  Receive notifications about agent activities and system updates
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailAlerts}
                      onChange={handleToggleChange('emailAlerts')}
                    />
                  }
                  label="Email Alerts"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                  Receive important alerts via email
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.darkMode}
                      onChange={handleToggleChange('darkMode')}
                    />
                  }
                  label="Dark Mode"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                  Toggle dark/light theme
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoAssign}
                      onChange={handleToggleChange('autoAssign')}
                    />
                  }
                  label="Auto-assign Tasks"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Automatically assign tasks to available agents
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Integration Settings
              </Typography>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="API Key"
                  value={settings.apiKey}
                  onChange={handleInputChange('apiKey')}
                  margin="normal"
                  type="password"
                />
                <TextField
                  fullWidth
                  label="Webhook URL"
                  value={settings.webhookUrl}
                  onChange={handleInputChange('webhookUrl')}
                  margin="normal"
                />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Management
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" color="error" fullWidth>
                  Clear All Data
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  This action will permanently delete all your data
                </Typography>

                <Button variant="outlined" fullWidth>
                  Export Data
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Download all your data in JSON format
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave}>
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;
