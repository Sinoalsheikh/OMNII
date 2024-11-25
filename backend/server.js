




const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const agentRoutes = require('./routes/agents');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from OmniFlow.Ai backend!' });
});

// Use agent routes
app.use('/api/agents', agentRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});




