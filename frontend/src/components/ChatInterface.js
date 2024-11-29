import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import agentService from '../services/agentService';

const ChatInterface = ({ agent }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);
    setError(null);

    try {
      const response = await agentService.processMessage(agent._id, message);
      
      if (response.success) {
        const agentMessage = { 
          role: 'assistant', 
          content: response.response,
          mode: response.mode 
        };
        setMessages(prev => [...prev, agentMessage]);
      } else {
        throw new Error(response.error || 'Failed to get response from agent');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setError(error.message || 'Error communicating with agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mb: 2, 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Typography variant="h6">
          {agent.name}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          ({agent.traits})
        </Typography>
      </Paper>

      {/* Messages Area */}
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1, 
          mb: 2, 
          p: 2, 
          overflowY: 'auto',
          bgcolor: 'background.default'
        }}
      >
        {/* Welcome Message */}
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
            <Typography variant="body1">
              👋 Hi! I'm {agent.name}. {agent.purpose}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              How can I help you today?
            </Typography>
          </Box>
        )}

        {/* Chat Messages */}
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              mb: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                maxWidth: '70%',
                bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper',
                color: msg.role === 'user' ? 'white' : 'text.primary',
                borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0'
              }}
            >
              <Typography variant="body1">
                {msg.content}
              </Typography>
              {msg.mode && msg.mode !== 'chat' && (
                <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                  ({msg.mode} mode)
                </Typography>
              )}
            </Paper>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Input Area */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px'
            }
          }}
        />
        <Button
          type="submit"
          variant="contained"
          endIcon={<SendIcon />}
          disabled={loading || !message.trim()}
          sx={{ borderRadius: '24px', px: 3 }}
        >
          Send
        </Button>
      </form>
    </Box>
  );
};

export default ChatInterface;
