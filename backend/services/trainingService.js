const { openai } = require('../config/openai');
const Agent = require('../models/Agent');
const fs = require('fs').promises;
const path = require('path');

class TrainingService {
  constructor() {
    this.trainingDataDir = path.join(__dirname, '../data/training');
    this.initializeDataDirectory();
  }

  async initializeDataDirectory() {
    try {
      await fs.mkdir(this.trainingDataDir, { recursive: true });
    } catch (error) {
      console.error('Error creating training data directory:', error);
    }
  }

  async processTrainingData(agentId, trainingData, customInstructions) {
    try {
      const agent = await Agent.findById(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Validate training data format
      this.validateTrainingData(trainingData);

      // Save training data to file system
      const filename = `agent_${agentId}_${Date.now()}.json`;
      const filePath = path.join(this.trainingDataDir, filename);
      await fs.writeFile(filePath, JSON.stringify(trainingData, null, 2));

      // Process training data with OpenAI
      const enhancedPrompt = this.generateTrainingPrompt(agent, customInstructions);
      const fineTuningResult = await this.fineTuneModel(trainingData, enhancedPrompt);

      // Update agent with new training information
      await this.updateAgentWithTraining(agent, fineTuningResult);

      return {
        success: true,
        message: 'Training completed successfully',
        details: fineTuningResult
      };
    } catch (error) {
      console.error('Error in training process:', error);
      throw error;
    }
  }

  validateTrainingData(data) {
    if (!Array.isArray(data)) {
      throw new Error('Training data must be an array of examples');
    }

    data.forEach((example, index) => {
      if (!example.input || !example.output) {
        throw new Error(`Invalid training example at index ${index}: missing input or output`);
      }
    });
  }

  generateTrainingPrompt(agent, customInstructions) {
    return `Fine-tune this AI assistant with the following configuration:
Role: ${agent.role}
Personality Traits: ${JSON.stringify(agent.personality)}
Skills: ${JSON.stringify(agent.skills)}
Custom Instructions: ${customInstructions}

Training Objectives:
1. Maintain consistent personality and communication style
2. Improve response accuracy and relevance
3. Enhance domain-specific knowledge
4. Optimize decision-making capabilities
5. Strengthen natural language understanding

Please process the following training examples to enhance these capabilities.`;
  }

  async fineTuneModel(trainingData, prompt) {
    try {
      // Prepare training data for OpenAI fine-tuning
      const formattedData = trainingData.map(example => ({
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: example.input },
          { role: 'assistant', content: example.output }
        ]
      }));

      // Create fine-tuning job
      const fineTuningJob = await openai.fineTuning.jobs.create({
        training_file: formattedData,
        model: 'gpt-3.5-turbo',
        hyperparameters: {
          n_epochs: 3,
          batch_size: 3,
          learning_rate_multiplier: 0.1
        }
      });

      return {
        jobId: fineTuningJob.id,
        status: fineTuningJob.status,
        model: fineTuningJob.model,
        createdAt: fineTuningJob.created_at
      };
    } catch (error) {
      console.error('Error in fine-tuning process:', error);
      throw error;
    }
  }

  async updateAgentWithTraining(agent, trainingResult) {
    try {
      // Update agent's AI model information
      agent.aiModel.lastTraining = {
        timestamp: new Date(),
        jobId: trainingResult.jobId,
        status: trainingResult.status,
        model: trainingResult.model
      };

      // Update agent's capabilities
      agent.aiModel.capabilities.push({
        name: 'custom_training',
        description: 'Custom-trained responses based on provided examples',
        enabled: true
      });

      await agent.save();
    } catch (error) {
      console.error('Error updating agent with training results:', error);
      throw error;
    }
  }

  async getTrainingStatus(jobId) {
    try {
      const job = await openai.fineTuning.jobs.retrieve(jobId);
      return {
        status: job.status,
        progress: job.progress,
        finishedAt: job.finished_at,
        error: job.error
      };
    } catch (error) {
      console.error('Error retrieving training status:', error);
      throw error;
    }
  }
}

module.exports = new TrainingService();
