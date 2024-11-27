const { openai, testConfig } = require('../config/openai');
const mongoose = require('mongoose');

let aiAvailable = false;

// Test OpenAI availability
(async () => {
  try {
    aiAvailable = await testConfig();
  } catch (error) {
    console.warn('OpenAI service unavailable:', error.message);
  }
})();

class AgentService {
  async initializeAgent(agent) {
    try {
      if (!agent || !agent.name || !agent.role) {
        throw new Error('Invalid agent configuration: Missing required fields');
      }

      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database connection is not established. Please ensure MongoDB is running.');
      }

      // Test OpenAI configuration
      const openAiConfigValid = await testConfig();
      if (!openAiConfigValid) {
        throw new Error('OpenAI configuration test failed');
      }

      // Initialize agent with default values if needed
      const defaultedAgent = {
        ...agent,
        aiModel: agent.aiModel || 'gpt-3.5-turbo',
        deployment: {
          ...agent.deployment,
          status: 'pending',
          monitoring: true,
          logging: true
        }
      };

      console.log(`Successfully initialized agent: ${defaultedAgent.name}`);
      return defaultedAgent;
    } catch (error) {
      console.error('Error initializing agent:', error);
      throw new Error(`Agent initialization failed: ${error.message}`);
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
      // Validate inputs
      if (!message) {
        throw new Error('Message is required');
      }
      if (!agentConfig || !agentConfig.role) {
        throw new Error('Invalid agent configuration');
      }

      // If OpenAI is not available, return a fallback response
      if (!aiAvailable) {
        return {
          success: true,
          response: "I apologize, but AI features are currently limited. The service is operating in fallback mode.",
          mode: "fallback"
        };
      }

      const systemPrompt = this.generateSystemPrompt(agentConfig);

      try {
        const completion = await openai.chat.completions.create({
          model: agentConfig.aiModel || "gpt-3.5-turbo",
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

        if (!completion?.choices?.[0]?.message?.content) {
          throw new Error('Invalid response from OpenAI API');
        }

        return {
          success: true,
          response: completion.choices[0].message.content,
          usage: completion.usage,
          mode: "ai"
        };
      } catch (error) {
        console.error('OpenAI API error:', error);
        // Fallback to basic response if OpenAI fails
        return {
          success: true,
          response: "I apologize, but I'm currently experiencing issues with the AI service. I'm operating in fallback mode.",
          mode: "fallback",
          error: error.message
        };
      }
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        success: false,
        error: error.message,
        details: error.stack,
        mode: "error"
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
