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
  async processMessage(message, agentConfig) {
    if (!message || !agentConfig) {
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
        ? `Hello! I'm ${agentConfig.name}, a ${agentConfig.traits} chatbot. ${agentConfig.purpose}`
        : null,
      help: lowercaseMessage.includes('help')
        ? `I'm here to ${agentConfig.purpose}. How can I assist you today?`
        : null
    };

    return responses.greeting || responses.help ||
      `I'm ${agentConfig.name}, a ${agentConfig.traits} chatbot. ${agentConfig.purpose} How can I help you?`;
  }

  generateSystemPrompt(agentConfig) {
    return `You are ${agentConfig.name}, a ${agentConfig.traits} chatbot.

Purpose: ${agentConfig.purpose}

Personality Traits:
${this.getTraitInstructions(agentConfig.traits)}

Please respond to all messages in a way that reflects these characteristics while focusing on your core purpose.`;
  }

  getTraitInstructions(trait) {
    const traits = {
      friendly: `- Be warm and approachable
- Use casual, welcoming language
- Show enthusiasm and positivity
- Make users feel comfortable`,
      
      professional: `- Maintain formal, business-like tone
- Be precise and efficient
- Show expertise and competence
- Keep interactions focused and structured`,
      
      casual: `- Be relaxed and conversational
- Use everyday language
- Be flexible in conversation flow
- Keep the tone light and natural`
    };

    return traits[trait] || traits.friendly;
  }
}

module.exports = new AgentService();
