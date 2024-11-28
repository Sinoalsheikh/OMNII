const express = require('express');
const router = express.Router();
const workflowService = require('../services/workflowService');
const auth = require('../middleware/auth');
const { body, query, param, validationResult } = require('express-validator');

// Validation middleware
const validateWorkflow = [
  body('name').trim().notEmpty().withMessage('Workflow name is required'),
  body('category').isIn([
    'customer_support',
    'sales',
    'marketing',
    'operations',
    'hr',
    'finance',
    'other'
  ]).withMessage('Invalid workflow category'),
  body('triggers').isArray().notEmpty().withMessage('At least one trigger is required'),
  body('actions').isArray().notEmpty().withMessage('At least one action is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Create new workflow
router.post('/', auth, validateWorkflow, async (req, res) => {
  try {
    const validationResults = await workflowService.validateWorkflow(req.body);
    
    if (!validationResults.isValid) {
      return res.status(400).json({
        errors: validationResults.errors,
        warnings: validationResults.warnings
      });
    }

    const workflow = await workflowService.createWorkflow(req.body, req.user._id);
    
    if (validationResults.warnings.length > 0) {
      return res.status(201).json({
        workflow,
        warnings: validationResults.warnings
      });
    }

    res.status(201).json({ workflow });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all workflows with filters
router.get('/', auth, [
  query('status').optional().isIn(['active', 'inactive', 'draft']),
  query('category').optional().isIn([
    'customer_support',
    'sales',
    'marketing',
    'operations',
    'hr',
    'finance',
    'other'
  ]),
  query('agent').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const filters = {
      status: req.query.status,
      category: req.query.category,
      agent: req.query.agent
    };

    const workflows = await workflowService.getWorkflows(req.user._id, filters);
    res.json({ workflows });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get workflow by ID
router.get('/:id', auth, [
  param('id').isMongoId().withMessage('Invalid workflow ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const workflow = await workflowService.getWorkflowById(req.params.id, req.user._id);
    res.json({ workflow });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(error.message === 'Workflow not found' ? 404 : 500).json({ error: error.message });
  }
});

// Update workflow
router.patch('/:id', auth, [
  param('id').isMongoId().withMessage('Invalid workflow ID'),
  ...validateWorkflow
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const validationResults = await workflowService.validateWorkflow(req.body);
    
    if (!validationResults.isValid) {
      return res.status(400).json({
        errors: validationResults.errors,
        warnings: validationResults.warnings
      });
    }

    const workflow = await workflowService.updateWorkflow(
      req.params.id,
      req.user._id,
      req.body
    );

    if (validationResults.warnings.length > 0) {
      return res.json({
        workflow,
        warnings: validationResults.warnings
      });
    }

    res.json({ workflow });
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(error.message === 'Workflow not found' ? 404 : 500).json({ error: error.message });
  }
});

// Delete workflow
router.delete('/:id', auth, [
  param('id').isMongoId().withMessage('Invalid workflow ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await workflowService.deleteWorkflow(req.params.id, req.user._id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(error.message === 'Workflow not found' ? 404 : 500).json({ error: error.message });
  }
});

// Execute workflow
router.post('/:id/execute', auth, [
  param('id').isMongoId().withMessage('Invalid workflow ID'),
  body('context').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await workflowService.executeWorkflow(
      req.params.id,
      req.user._id,
      req.body.context || {}
    );
    res.json({ success: result });
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get workflow performance metrics
router.get('/:id/performance', auth, [
  param('id').isMongoId().withMessage('Invalid workflow ID'),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const dateRange = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const metrics = await workflowService.analyzeWorkflowPerformance(
      req.params.id,
      req.user._id,
      dateRange
    );
    res.json({ metrics });
  } catch (error) {
    console.error('Error fetching workflow performance:', error);
    res.status(error.message === 'Workflow not found' ? 404 : 500).json({ error: error.message });
  }
});

// Clone workflow
router.post('/:id/clone', auth, [
  param('id').isMongoId().withMessage('Invalid workflow ID'),
  body('name').optional().trim().notEmpty().withMessage('New workflow name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const clonedWorkflow = await workflowService.cloneWorkflow(
      req.params.id,
      req.user._id,
      req.body.name
    );
    res.status(201).json({ workflow: clonedWorkflow });
  } catch (error) {
    console.error('Error cloning workflow:', error);
    res.status(error.message === 'Workflow not found' ? 404 : 500).json({ error: error.message });
  }
});

// Generate workflow suggestions
router.post('/suggest', auth, [
  body('description').trim().notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const suggestion = await workflowService.generateWorkflowSuggestions(req.body.description);
    res.json({ suggestion });
  } catch (error) {
    console.error('Error generating workflow suggestions:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
