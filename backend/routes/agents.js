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
  const { aiModel, skills, communication } = req.body;

  // Validate AI Model
  if (aiModel) {
    if (!aiModel.type) {
      errors.push('AI model type is required');
    }
    if (aiModel.capabilities) {
      aiModel.capabilities.forEach((cap, index) => {
        if (!cap.name) errors.push(`Capability ${index + 1} name is required`);
        if (!cap.description) errors.push(`Capability ${index + 1} description is required`);
      });
    }
    if (aiModel.knowledgeBase) {
      aiModel.knowledgeBase.forEach((kb, index) => {
        if (!kb.name) errors.push(`Knowledge base ${index + 1} name is required`);
        if (!kb.category) errors.push(`Knowledge base ${index + 1} category is required`);
      });
    }
  }

  // Validate Skills
  if (skills) {
    skills.forEach((skill, index) => {
      if (!skill.name) errors.push(`Skill ${index + 1} name is required`);
      if (!skill.category) errors.push(`Skill ${index + 1} category is required`);
      if (skill.proficiency < 0 || skill.proficiency > 100) {
        errors.push(`Skill ${index + 1} proficiency must be between 0 and 100`);
      }
    });
  }

  // Validate Communication Channels
  if (communication?.channels) {
    communication.channels.forEach((channel, index) => {
      if (!channel.type) errors.push(`Channel ${index + 1} type is required`);
      if (!['chat', 'email', 'voice', 'video', 'sms'].includes(channel.type)) {
        errors.push(`Channel ${index + 1} type must be one of: chat, email, voice, video, sms`);
      }
    });
  }

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
router.put('/:id', validateAgent, async (req, res) => {
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
