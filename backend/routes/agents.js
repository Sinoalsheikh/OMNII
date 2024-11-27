const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const agentService = require('../services/agentService');
const auth = require('../middleware/auth');

// Error handler wrapper
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validate agent data middleware
const validateAgentData = (req, res, next) => {
  const { name, role } = req.body;
  
  if (!name || !role) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: {
        name: !name ? 'Name is required' : null,
        role: !role ? 'Role is required' : null
      }
    });
  }

  next();
};

// Create a new agent
router.post('/', [auth, validateAgentData], asyncHandler(async (req, res) => {
  const agent = new Agent({
    ...req.body,
    owner: req.user.userId,
    deployment: {
      ...req.body.deployment,
      status: 'pending'
    }
  });

  await agent.save();

  // Initialize agent if auto-start is enabled
  if (agent.deployment?.autoStart) {
    try {
      await agentService.initializeAgent(agent);
      agent.deployment.status = 'active';
      await agent.save();
    } catch (error) {
      console.error('Error initializing agent:', error);
      agent.deployment.status = 'error';
      agent.deployment.lastError = error.message;
      await agent.save();
    }
  }

  res.status(201).json(agent);
}));

// Get all agents for the authenticated user with filtering and pagination
router.get('/', auth, asyncHandler(async (req, res) => {
  const match = { owner: req.user.userId };
  const sort = {};

  // Apply filters
  if (req.query.status) {
    match['deployment.status'] = req.query.status;
  }
  if (req.query.role) {
    match.role = req.query.role;
  }

  // Apply sorting
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  // Pagination
  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;

  const agents = await Agent.find(match)
    .sort(sort)
    .limit(limit)
    .skip(skip);

  const total = await Agent.countDocuments(match);

  res.json({
    agents,
    total,
    page: Math.floor(skip / limit) + 1,
    pageSize: limit
  });
}));

// Get a specific agent
router.get('/:id', auth, asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ _id: req.params.id, owner: req.user.userId });
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  // Include performance metrics if requested
  if (req.query.includeMetrics) {
    agent.performance = await agentService.getAgentMetrics(agent._id);
  }

  res.json(agent);
}));

// Update an agent
router.patch('/:id', [auth, validateAgentData], asyncHandler(async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'name', 'role', 'description', 'personality', 'customization',
    'scripts', 'tasks', 'workflows', 'skills', 'communication',
    'integrations', 'aiModel', 'learningRate', 'autonomyLevel',
    'communicationSkill', 'problemSolving', 'deployment'
  ];

  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  const agent = await Agent.findOne({ _id: req.params.id, owner: req.user.userId });
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  // Apply updates
  updates.forEach(update => agent[update] = req.body[update]);
  
  // Handle deployment status changes
  if (req.body.deployment?.status === 'active' && agent.deployment.status !== 'active') {
    try {
      await agentService.initializeAgent(agent);
    } catch (error) {
      return res.status(500).json({ 
        error: 'Failed to activate agent',
        details: error.message
      });
    }
  }

  await agent.save();
  res.json(agent);
}));

// Delete an agent
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ _id: req.params.id, owner: req.user.userId });
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  // Cleanup agent resources before deletion
  if (agent.deployment?.status === 'active') {
    try {
      await agentService.cleanupAgent(agent);
    } catch (error) {
      console.error('Error cleaning up agent:', error);
      // Continue with deletion even if cleanup fails
    }
  }

  await agent.remove();
  res.json({ message: 'Agent deleted successfully', agent });
}));

// Process a message with an agent
router.post('/:id/process', auth, asyncHandler(async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const agent = await Agent.findOne({ _id: req.params.id, owner: req.user.userId });
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  // Check if agent is active
  if (agent.deployment?.status !== 'active') {
    return res.status(400).json({ error: 'Agent is not active' });
  }

  const response = await agentService.processMessage(message, agent);
  
  // Update agent's performance metrics
  if (response.success) {
    agent.performance.responseTime = response.metadata?.processingTime || 0;
    agent.performance.accuracyScore = (agent.performance.accuracyScore + 1) / 2;
    await agent.save();
  }

  res.json(response);
}));

// Execute a workflow
router.post('/:id/workflow/:workflowId', auth, asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ _id: req.params.id, owner: req.user.userId });
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  const workflow = agent.workflows.find(w => w._id.toString() === req.params.workflowId);
  if (!workflow) {
    return res.status(404).json({ error: 'Workflow not found' });
  }

  // Check if workflow is active
  if (workflow.status !== 'active') {
    return res.status(400).json({ error: 'Workflow is not active' });
  }

  const response = await agentService.executeWorkflow(workflow, req.body.context, agent);
  
  // Update workflow execution metrics
  if (response.success) {
    workflow.lastExecuted = new Date();
    workflow.executionCount = (workflow.executionCount || 0) + 1;
    await agent.save();
  }

  res.json(response);
}));

// Get agent performance metrics
router.get('/:id/metrics', auth, asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ _id: req.params.id, owner: req.user.userId });
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  const metrics = await agentService.getAgentMetrics(agent._id);
  res.json(metrics);
}));

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Agent route error:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    code: error.code || 'UNKNOWN_ERROR'
  });
});

module.exports = router;
