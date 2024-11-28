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

      // Initialize knowledge base
      const defaultKnowledgeBase = [{
        name: 'General Knowledge',
        description: 'Basic information and common responses',
        content: this.generateBaseKnowledge(agent),
        category: 'general',
        lastUpdated: new Date()
      }];

      // Initialize training data
      const defaultTrainingData = [{
        type: 'initial_setup',
        data: {
          role: agent.role,
          personality: agent.personality,
          skills: agent.skills
        },
        timestamp: new Date()
      }];

      // Initialize agent with enhanced default values
      const defaultedAgent = {
        ...agent,
        aiModel: {
          type: agent.aiModel?.type || 'gpt-4',
          capabilities: [
            {
              name: 'conversation',
              description: 'Natural language conversation capabilities',
              enabled: true
            },
            {
              name: 'task_execution',
              description: 'Ability to execute defined tasks and workflows',
              enabled: true
            }
          ],
          customization: {
            temperature: 0.7,
            maxTokens: 1000,
            topP: 1
          }
        },
        skills: agent.skills || [
          {
            name: 'Communication',
            proficiency: 80,
            description: 'Effective communication and interaction skills',
            category: 'soft'
          }
        ],
        communication: {
          channels: agent.communication?.channels || [
            {
              type: 'chat',
              status: 'active',
              preferences: {
                responseTime: 30,
                autoReply: {
                  enabled: true,
                  message: `Hello! I'm ${agent.name}, your ${agent.role}. How can I assist you today?`
                },
                workingHours: {
                  enabled: false,
                  schedule: []
                }
              }
            }
          ],
          languages: agent.communication?.languages || [
            {
              code: 'en',
              proficiency: 'fluent'
            }
          ]
        },
        deployment: {
          ...agent.deployment,
          status: 'pending',
          monitoring: true,
          logging: true,
          healthCheck: {
            enabled: true,
            interval: 300 // 5 minutes
          }
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

    // Track performance metrics
    const startTime = Date.now();

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

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Update agent's performance metrics
      await this.updatePerformanceMetrics(agentConfig._id, {
        responseTime,
        messageType: 'ai',
        success: true
      });

      return {
        success: true,
        response: completion.choices[0].message.content,
        usage: completion.usage,
        mode: 'ai',
        metrics: {
          responseTime,
          timestamp: new Date()
        }
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
      customization = {},
      skills = [],
      communication = {}
    } = agentConfig;

    const skillsList = skills.map(skill => 
      `- ${skill.name} (${skill.category}): Proficiency ${skill.proficiency}%`
    ).join('\n');

    const languages = communication.languages?.map(lang => 
      `- ${lang.code.toUpperCase()}: ${lang.proficiency}`
    ).join('\n') || '- EN: fluent';

    return `You are an advanced AI assistant with the following configuration:

Role: ${role}
Personality:
- Trait: ${personality.trait || 'Professional'}
- Communication Style: ${personality.communicationStyle || 'Clear and Direct'}
- Response Style: ${personality.responseStyle || 'Helpful'}
- Voice Tone: ${customization.voiceTone || 'Professional'}
- Decision Making: ${customization.decisionMaking || 'balanced'}

Skills:
${skillsList}

Languages:
${languages}

Communication Channels: ${communication.channels?.map(c => c.type).join(', ') || 'chat'}

Special Instructions:
1. Maintain consistent personality and communication style
2. Adapt responses based on user's communication preferences
3. Use appropriate technical depth based on context
4. Proactively offer relevant information and assistance
5. Escalate complex issues when necessary

Please respond to all messages in a way that reflects these characteristics and capabilities.`;
  }

  async updatePerformanceMetrics(agentId, metrics) {
    try {
      const Agent = mongoose.model('Agent');
      const agent = await Agent.findById(agentId);
      
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Update response time history
      if (metrics.responseTime) {
        agent.performance.responseTime.history.push({
          value: metrics.responseTime,
          timestamp: new Date()
        });

        // Calculate average response time
        const recentHistory = agent.performance.responseTime.history.slice(-10);
        agent.performance.responseTime = recentHistory.reduce((acc, curr) => acc + curr.value, 0) / recentHistory.length;
      }

      // Update learning progress
      if (metrics.messageType === 'ai' && metrics.success) {
        const currentProgress = agent.performance.learningProgress || 0;
        const progressIncrement = 0.5; // Increment by 0.5% per successful interaction
        
        agent.performance.learningProgress = Math.min(100, currentProgress + progressIncrement);
        agent.performance.learningProgress.history.push({
          value: agent.performance.learningProgress,
          timestamp: new Date(),
          milestone: this.calculateMilestone(agent.performance.learningProgress)
        });
      }

      // Update adaptability score
      const adaptabilityIncrement = metrics.success ? 1 : -1;
      agent.performance.adaptabilityScore = Math.max(0, Math.min(100, 
        (agent.performance.adaptabilityScore || 50) + adaptabilityIncrement
      ));

      await agent.save();
      return agent.performance;
    } catch (error) {
      console.error('Error updating performance metrics:', error);
      throw error;
    }
  }

  generateBaseKnowledge(agent) {
    return `
Base Knowledge for ${agent.name} (${agent.role})

1. Core Responsibilities
- Primary Role: ${agent.role}
- Key Functions: ${agent.skills.map(s => s.name).join(', ')}
- Communication Channels: ${agent.communication.channels.map(c => c.type).join(', ')}

2. Personality Framework
- Trait: ${agent.personality.trait}
- Communication Style: ${agent.personality.communicationStyle}
- Response Style: ${agent.personality.responseStyle}
- Voice Tone: ${agent.customization.voiceTone}

3. Standard Operating Procedures
- Response Time Target: ${agent.communication.channels[0]?.preferences.responseTime || 30} seconds
- Working Hours: ${agent.communication.channels[0]?.preferences.workingHours.enabled ? 'Scheduled' : '24/7'}
- Escalation Protocol: Based on issue complexity and user satisfaction

4. Skills and Expertise
${agent.skills.map(skill => `
- ${skill.name}
  Proficiency: ${skill.proficiency}%
  Category: ${skill.category}
  Description: ${skill.description}
`).join('\n')}

5. Language Capabilities
${agent.communication.languages.map(lang => `- ${lang.code.toUpperCase()}: ${lang.proficiency}`).join('\n')}

This knowledge base serves as the foundation for ${agent.name}'s interactions and decision-making processes.
`;
  }

  calculateMilestone(progress) {
    const milestones = {
      25: 'Basic Training Complete',
      50: 'Intermediate Proficiency Achieved',
      75: 'Advanced Capabilities Unlocked',
      100: 'Expert Level Mastery'
    };

    const threshold = Object.keys(milestones)
      .map(Number)
      .reverse()
      .find(level => progress >= level);

    return threshold ? milestones[threshold] : null;
  }
}

module.exports = new AgentService();
