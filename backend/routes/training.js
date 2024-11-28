const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const trainingService = require('../services/trainingService');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Initialize training for an agent
router.post('/:agentId/train', auth, upload.single('trainingData'), async (req, res) => {
  try {
    const { agentId } = req.params;
    const { customInstructions } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Training data file is required' });
    }

    let trainingData;
    try {
      trainingData = JSON.parse(req.file.buffer.toString());
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON format in training data' });
    }

    const result = await trainingService.processTrainingData(
      agentId,
      trainingData,
      customInstructions
    );

    res.json(result);
  } catch (error) {
    console.error('Error in training endpoint:', error);
    res.status(500).json({ 
      error: 'Training process failed',
      details: error.message 
    });
  }
});

// Get training status
router.get('/:agentId/training/:jobId', auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await trainingService.getTrainingStatus(jobId);
    res.json(status);
  } catch (error) {
    console.error('Error getting training status:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve training status',
      details: error.message 
    });
  }
});

// Get training history for an agent
router.get('/:agentId/history', auth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const history = await trainingService.getTrainingHistory(agentId);
    res.json(history);
  } catch (error) {
    console.error('Error getting training history:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve training history',
      details: error.message 
    });
  }
});

module.exports = router;
