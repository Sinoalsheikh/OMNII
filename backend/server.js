require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('./config/database');
const { openai, testConfig } = require('./config/openai');
const agentService = require('./services/agentService');

// Test OpenAI configuration
(async () => {
  try {
    const openAiConfigValid = await testConfig();
    if (!openAiConfigValid) {
      console.warn('OpenAI configuration test failed. AI features may be limited.');
    } else {
      console.log('OpenAI configuration validated successfully');
    }
  } catch (error) {
    console.warn('Error testing OpenAI configuration:', error.message);
  }
})();

const app = express();
let dbConnected = false;

// Connect to MongoDB
(async () => {
  try {
    const connected = await connectDB();
    if (!connected) {
      console.warn('Failed to connect to MongoDB. Running in limited mode (no persistence).');
    } else {
      dbConnected = true;
      console.log('MongoDB connected successfully');
    }
  } catch (error) {
    console.warn('Error connecting to MongoDB:', error);
    console.warn('Running in limited mode (no persistence).');
  }
})();

const port = process.env.PORT || 5002;

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3004'
].filter(Boolean); // Remove any undefined/null values

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware to check database connection
const checkDbConnection = (req, res, next) => {
  if (!dbConnected && req.method !== 'GET') {
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      details: 'Database connection is not established. Please try again later.'
    });
  }
  next();
};

// Routes
const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const voiceRoutes = require('./routes/voice');
const workflowRoutes = require('./routes/workflows');
const trainingRoutes = require('./routes/training');
const affiliateRoutes = require('./routes/affiliates');

// Apply auth middleware to protected routes
const authMiddleware = require('./middleware/auth');

// Configure static file serving for audio files
const fs = require('fs');
const path = require('path');
const audioDir = path.join(__dirname, 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir);
}
app.use('/audio', express.static('audio'));

app.use('/api/auth', authRoutes);
app.use('/api/agents', authMiddleware, checkDbConnection, agentRoutes);
app.use('/api/voice', authMiddleware, checkDbConnection, voiceRoutes);
app.use('/api/workflows', authMiddleware, checkDbConnection, workflowRoutes);
app.use('/api/training', authMiddleware, checkDbConnection, trainingRoutes);
app.use('/api/affiliates', authMiddleware, checkDbConnection, affiliateRoutes);

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
  server.close(async () => {
    console.log('HTTP server closed.');
    
    // Close database connection using the new disconnectDB function
    await disconnectDB();
    console.log('MongoDB connection closed.');
    process.exit(0);
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
