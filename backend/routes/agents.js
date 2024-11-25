

const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');

// Create a new agent
router.post('/', async (req, res) => {
  try {
    const { name, role } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }
    
    const newAgent = new Agent({ name, role });
    await newAgent.save();
    
    res.status(201).json(newAgent);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all agents
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find().sort({ createdAt: -1 });
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

