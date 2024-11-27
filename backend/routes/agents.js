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

// Create a new agent
router.post('/', async (req, res) => {
  try {
    const agentData = {
      ...req.body,
      owner: req.user.userId
    };

    // Initialize agent with service
    const initializedAgent = await agentService.initializeAgent(agentData);
    
    // Create agent in database
    const agent = new Agent(initializedAgent);
    await agent.save();

    // Return response with limitations warning if applicable
    const response = {
      message: 'Agent created successfully',
      agent
    };

    if (initializedAgent.limitations) {
      response.warning = {
        message: 'Agent created with limited functionality',
        details: initializedAgent.limitations
      };
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get agent by ID
router.get('/:id', async (req, res) => {
  try {
    const agent = await Agent.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update agent
router.put('/:id', async (req, res) => {
  try {
    const agent = await Agent.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Initialize updated agent data
    const updatedData = await agentService.initializeAgent({
      ...agent.toObject(),
      ...req.body
    });

    // Update agent
    Object.assign(agent, updatedData);
    await agent.save();

    // Return response with limitations warning if applicable
    const response = {
      message: 'Agent updated successfully',
      agent
    };

    if (updatedData.limitations) {
      response.warning = {
        message: 'Agent updated with limited functionality',
        details: updatedData.limitations
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete agent
router.delete('/:id', async (req, res) => {
  try {
    const agent = await Agent.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Interact with agent
router.post('/:id/interact', async (req, res) => {
  try {
    const { message } = req.body;
    const agent = await Agent.findOne({ _id: req.params.id, owner: req.user.userId });
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const response = await agentService.processMessage(message, agent);
    
    // Add warning if in fallback mode
    if (response.mode === 'fallback') {
      response.warning = {
        message: 'Operating in fallback mode with limited AI capabilities',
        reason: 'OpenAI service not available'
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
