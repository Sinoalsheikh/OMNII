
const express = require('express');
const router = express.Router();

// Temporary storage for agents (replace with database later)
let agents = [];

// Create a new agent
router.post('/', (req, res) => {
  const { name, role } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: 'Name and role are required' });
  }
  
  const newAgent = {
    id: agents.length + 1,
    name,
    role,
    createdAt: new Date()
  };
  
  agents.push(newAgent);
  res.status(201).json(newAgent);
});

// Get all agents
router.get('/', (req, res) => {
  res.json(agents);
});

module.exports = router;
