




const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

// Create a new agent (admin only)
router.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { name, role } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }
    
    const newAgent = new Agent({ name, role, user: req.user.userId });
    await newAgent.save();
    
    res.status(201).json(newAgent);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all agents (admin and user)
router.get('/', authMiddleware, roleMiddleware(['admin', 'user']), async (req, res) => {
  try {
    let agents;
    if (req.user.role === 'admin') {
      agents = await Agent.find().sort({ createdAt: -1 });
    } else {
      agents = await Agent.find({ user: req.user.userId }).sort({ createdAt: -1 });
    }
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;




