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
        setError('Failed to get response from agent');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error communicating with agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
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
                color: msg.role === 'user' ? 'white' : 'text.primary'
              }}
            >
              <Typography variant="body1">
                {msg.content}
              </Typography>
              {msg.mode === 'fallback' && (
                <Typography variant="caption" color="warning.main">
                  (Fallback Mode)
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
        />
        <Button
          type="submit"
          variant="contained"
          endIcon={<SendIcon />}
          disabled={loading || !message.trim()}
        >
          Send
        </Button>
      </form>
    </Box>
  );
};

export default ChatInterface;
