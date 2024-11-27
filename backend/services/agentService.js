const openai = require('../config/openai');

class AgentService {
  async initializeAgent(agent) {
    try {
      // Initialize agent resources and configurations
      console.log(`Initializing agent: ${agent.name}`);
      return true;
    } catch (error) {
      console.error('Error initializing agent:', error);
      throw error;
    }
  }

  async cleanupAgent(agent) {
    try {
      // Cleanup agent resources
      console.log(`Cleaning up agent: ${agent.name}`);
      return true;
    } catch (error) {
      console.error('Error cleaning up agent:', error);
      throw error;
    }
  }

  async getAgentMetrics(agentId) {
    try {
      // Return default metrics for now
      return {
        responseTime: 0,
        taskCompletionRate: 0,
        customerSatisfaction: 0,
        accuracyScore: 0
      };
    } catch (error) {
      console.error('Error getting agent metrics:', error);
      throw error;
    }
  }

  async processMessage(message, agentConfig) {
    try {
      const systemPrompt = this.generateSystemPrompt(agentConfig);
      
      // Validate inputs
      if (!message) {
        throw new Error('Message is required');
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",  // Changed from gpt-4 to gpt-3.5-turbo
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return {
        success: true,
        response: completion.choices[0].message.content,
        usage: completion.usage
      };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateSystemPrompt(agentConfig) {
    const {
      role,
      personality,
      customization
    } = agentConfig;

    return `You are an AI assistant with the following configuration:
Role: ${role}
Personality Trait: ${personality.trait}
Communication Style: ${personality.communicationStyle}
Response Style: ${personality.responseStyle}
Voice Tone: ${customization.voiceTone}
Decision Making: ${customization.decisionMaking}

Please respond to all messages in a way that reflects these characteristics.`;
  }
}

module.exports = new AgentService();
