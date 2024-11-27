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

      // Add warning if AI features are limited
      if (!aiAvailable) {
        defaultedAgent.limitations = {
          aiFeatures: 'limited',
          reason: 'OpenAI service not available',
          fallbackMode: true
        };
        console.log('Agent initialized with limited AI features:', defaultedAgent.limitations);
      }

      console.log(`Successfully initialized agent: ${defaultedAgent.name}`);
      return defaultedAgent;
    } catch (error) {
      console.error('Error initializing agent:', error);
      throw error;
    }
  }

  async processMessage(message, agentConfig) {
    if (!message || !agentConfig || !agentConfig.role) {
      console.error('Invalid input:', { message, agentConfig });
      return {
        success: false,
        error: 'Invalid input parameters',
        mode: 'error'
      };
    }

    // If OpenAI is not available, use rule-based responses
    if (!aiAvailable) {
      console.log('Using fallback response mode');
      return {
        success: true,
        response: this.getFallbackResponse(message, agentConfig),
        mode: 'fallback'
      };
    }

    try {
      const systemPrompt = this.generateSystemPrompt(agentConfig);
      const completion = await openai.chat.completions.create({
        model: agentConfig.aiModel || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
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
        mode: 'ai'
      };
    } catch (error) {
      console.error('Error in AI processing:', error);
      return {
        success: true,
        response: this.getFallbackResponse(message, agentConfig),
        mode: 'fallback',
        error: error.message
      };
    }
  }

  getFallbackResponse(message, agentConfig) {
    const lowercaseMessage = message.toLowerCase();
    const responses = {
      greeting: lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')
        ? `Hello! I'm your ${agentConfig.role}. I'm currently operating in basic mode, but I'll do my best to assist you.`
        : null,
      help: lowercaseMessage.includes('help')
        ? `I'm here to help as your ${agentConfig.role}. While AI features are limited, I can still assist with basic tasks and information.`
        : null,
      status: lowercaseMessage.includes('status')
        ? `I'm currently operating in basic mode due to AI service limitations. I can still help with fundamental tasks.`
        : null
    };

    return responses.greeting || responses.help || responses.status ||
      `I understand you're trying to communicate with me. As your ${agentConfig.role}, I'm currently operating in basic mode with limited AI capabilities. I can still assist you with fundamental tasks. Please let me know how I can help.`;
  }

  generateSystemPrompt(agentConfig) {
    const {
      role,
      personality = {},
      customization = {}
    } = agentConfig;

    return `You are an AI assistant with the following configuration:
Role: ${role}
Personality Trait: ${personality.trait || 'Professional'}
Communication Style: ${personality.communicationStyle || 'Clear and Direct'}
Response Style: ${personality.responseStyle || 'Helpful'}
Voice Tone: ${customization.voiceTone || 'Professional'}
Decision Making: ${customization.decisionMaking || 'balanced'}

Please respond to all messages in a way that reflects these characteristics.`;
  }
}

module.exports = new AgentService();
