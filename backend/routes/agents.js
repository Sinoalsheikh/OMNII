const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const agentService = require('../services/agentService');

// Get all agents for the current user
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find({ owner: req.user.userId });
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: error.message });
  }
});

// Validation middleware
const validateAgent = (req, res, next) => {
  const errors = [];
  const { name, traits, purpose } = req.body;

  if (!name) errors.push('Name is required');
  if (!traits) errors.push('Traits is required');
  if (!['friendly', 'professional', 'casual'].includes(traits)) {
    errors.push('Traits must be one of: friendly, professional, casual');
  }
  if (!purpose) errors.push('Purpose is required');

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// Create a new agent
router.post('/', validateAgent, async (req, res) => {
  try {
    const agentData = {
      ...req.body,
      owner: req.user.userId,
      aiModel: 'gpt-3.5-turbo' // Default model
    };

    const agent = new Agent(agentData);
    await agent.save();

    res.status(201).json({
      message: 'Chatbot created successfully',
      agent
    });
  } catch (error) {
    console.error('Error creating chatbot:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get agent by ID
router.get('/:id', async (req, res) => {
  try {
    const agent = await Agent.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!agent) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }
    res.json(agent);
  } catch (error) {
    console.error('Error fetching chatbot:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update agent
router.put('/:id', validateAgent, async (req, res) => {
  try {
    const agent = await Agent.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!agent) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    res.json({
      message: 'Chatbot updated successfully',
      agent
    });
  } catch (error) {
    console.error('Error updating chatbot:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete agent
router.delete('/:id', async (req, res) => {
  try {
    const agent = await Agent.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!agent) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }
    res.json({ message: 'Chatbot deleted successfully' });
  } catch (error) {
    console.error('Error deleting chatbot:', error);
    res.status(500).json({ error: error.message });
  }
});

// Interact with agent
router.post('/:id/interact', async (req, res) => {
  try {
    const { message } = req.body;
    const agent = await Agent.findOne({ _id: req.params.id, owner: req.user.userId });
    
    if (!agent) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Use agentService to process the message
    const response = await agentService.processMessage(message, {
      name: agent.name,
      traits: agent.traits,
      purpose: agent.purpose,
      aiModel: agent.aiModel
    });

    res.json(response);
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
