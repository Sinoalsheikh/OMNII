import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import AgentCreationForm from '../components/AgentCreationForm';

const AgentCreation = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 4 },
          bgcolor: 'background.default',
          borderRadius: 3,
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '2rem', sm: '2.5rem' }
            }}
          >
            Create Your Chatbot
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ 
              maxWidth: '600px',
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.1rem' }
            }}
          >
            Create your own AI chatbot in three simple steps: give it a name, choose its personality,
            and define its purpose.
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2, sm: 4 } }}>
          <AgentCreationForm />
        </Box>
      </Paper>
    </Container>
  );
};

export default AgentCreation;
