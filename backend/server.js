require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const agentService = require('./services/agentService');

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const agentRoutes = require('./routes/agents');
app.use('/api/agents', agentRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Simple agent interaction endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create a simple agent config for testing
    const testAgent = {
      aiModel: 'gpt-3.5-turbo',  // Changed to gpt-3.5-turbo
      role: 'Technical Assistant',
      personality: {
        trait: 'Professional',
        communicationStyle: 'Technical',
        responseStyle: 'Detailed'
      },
      customization: {
        voiceTone: 'Professional',
        decisionMaking: 'balanced'
      }
    };

    const response = await agentService.processMessage(message, testAgent);
    res.json(response);
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Create HTTP server
const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Received shutdown signal. Starting graceful shutdown...');
  
  // Close the HTTP server
  server.close(() => {
    console.log('HTTP server closed.');
    
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle various signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  shutdown();
});
