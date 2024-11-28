const twilio = require('twilio');
const textToSpeech = require('@google-cloud/text-to-speech').TextToSpeechClient;
const { Readable } = require('stream');
const { openai } = require('../config/openai');

let twilioClient = null;
let ttsClient = null;
let servicesAvailable = {
  twilio: false,
  tts: false
};

// Initialize Twilio client if credentials are available
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    servicesAvailable.twilio = true;
    console.log('Twilio client initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize Twilio client:', error.message);
  }
}

// Initialize Google Text-to-Speech client if credentials are available
try {
  ttsClient = new textToSpeech();
  servicesAvailable.tts = true;
  console.log('Google Text-to-Speech client initialized successfully');
} catch (error) {
  console.warn('Failed to initialize Google Text-to-Speech client:', error.message);
}

class VoiceService {
  async makeCall(phoneNumber, agentConfig, initialMessage) {
    if (!servicesAvailable.twilio || !servicesAvailable.tts) {
      throw new Error('Voice services are not fully configured. Please check your environment variables.');
    }

    try {
      // Convert text to speech
      const [response] = await ttsClient.synthesizeSpeech({
        input: { text: initialMessage },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Neural2-D',
          ssmlGender: 'NEUTRAL'
        },
        audioConfig: { audioEncoding: 'MP3' }
      });

      // Create a readable stream from the audio buffer
      const audioStream = new Readable();
      audioStream.push(response.audioContent);
      audioStream.push(null);

      // Make the call using Twilio
      const call = await twilioClient.calls.create({
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
        twiml: `
          <Response>
            <Play>${process.env.BASE_URL}/audio/agent-message.mp3</Play>
            <Gather input="speech" timeout="3" action="/api/voice/respond">
              <Say>Please speak after the tone.</Say>
            </Gather>
          </Response>
        `
      });

      return {
        success: true,
        callSid: call.sid,
        status: call.status
      };
    } catch (error) {
      console.error('Error making voice call:', error);
      throw error;
    }
  }

  async handleResponse(callSid, speechResult) {
    if (!servicesAvailable.twilio || !servicesAvailable.tts) {
      throw new Error('Voice services are not fully configured. Please check your environment variables.');
    }

    try {
      // Process the customer's speech with OpenAI
      const agentResponse = await this.processAgentResponse(speechResult);

      // Convert agent's response to speech
      const [response] = await ttsClient.synthesizeSpeech({
        input: { text: agentResponse },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Neural2-D',
          ssmlGender: 'NEUTRAL'
        },
        audioConfig: { audioEncoding: 'MP3' }
      });

      // Update the call with the agent's response
      await twilioClient.calls(callSid).update({
        twiml: `
          <Response>
            <Play>${process.env.BASE_URL}/audio/agent-response.mp3</Play>
            <Gather input="speech" timeout="3" action="/api/voice/respond">
              <Say>Please speak after the tone.</Say>
            </Gather>
          </Response>
        `
      });

      return {
        success: true,
        response: agentResponse
      };
    } catch (error) {
      console.error('Error handling voice response:', error);
      throw error;
    }
  }

  async processAgentResponse(customerInput, agentConfig, callContext) {
    try {
      // Get product knowledge and sales scripts for the agent
      const agent = await Agent.findById(agentConfig._id)
        .populate('productKnowledge.productId')
        .select('scripts productKnowledge performance');

      // Determine sales phase based on conversation context
      const salesPhase = this.determineSalesPhase(callContext);
      
      // Get relevant script for current sales phase
      const relevantScript = agent.scripts.find(script => 
        script.salesPhase === salesPhase && 
        script.effectiveness > 70
      );

      // Get relevant product knowledge based on conversation context
      const relevantProducts = this.getRelevantProducts(customerInput, agent.productKnowledge);

      // Process customer input and generate agent response using OpenAI
      const response = await openai.chat.completions.create({
        model: agentConfig.aiModel || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: this.generateSalesPrompt(agent, salesPhase, relevantScript, relevantProducts)
          },
          { 
            role: 'user', 
            content: this.formatCustomerInput(customerInput, callContext)
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      // Update agent's performance metrics
      await this.updateAgentMetrics(agent, salesPhase, customerInput);

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error processing agent response:', error);
      throw error;
    }
  }

  determineSalesPhase(callContext) {
    const { duration, customerResponses, lastPhase } = callContext;
    
    // Initial call
    if (!lastPhase || duration < 30) return 'introduction';
    
    // Check for buying signals or objections
    const buyingSignals = this.detectBuyingSignals(customerResponses);
    const objections = this.detectObjections(customerResponses);
    
    if (buyingSignals > objections && lastPhase === 'presentation') {
      return 'closing';
    } else if (objections > 0 && lastPhase !== 'handling_objections') {
      return 'handling_objections';
    }
    
    // Progress through sales phases
    const phases = ['introduction', 'discovery', 'presentation', 'handling_objections', 'closing'];
    const currentIndex = phases.indexOf(lastPhase);
    return phases[Math.min(currentIndex + 1, phases.length - 1)];
  }

  getRelevantProducts(customerInput, productKnowledge) {
    return productKnowledge
      .filter(product => {
        const relevanceScore = this.calculateProductRelevance(
          customerInput, 
          product.keyFeatures
        );
        return relevanceScore > 0.7;
      })
      .sort((a, b) => b.proficiency - a.proficiency)
      .slice(0, 3);
  }

  generateSalesPrompt(agent, salesPhase, script, relevantProducts) {
    const basePrompt = `You are a professional sales agent with the following characteristics:
    - Communication Style: ${agent.personality?.communicationStyle || 'Professional and friendly'}
    - Current Sales Phase: ${salesPhase}
    ${script ? `- Recommended Script: ${script.content}` : ''}
    
    Key Products to Focus On:
    ${relevantProducts.map(p => `- ${p.productId.name}: ${p.keyFeatures.join(', ')}`).join('\n')}
    
    Common Objections and Responses:
    ${relevantProducts.map(p => 
      p.commonObjections.map(obj => 
        `Q: ${obj.objection}\nA: ${obj.response}`
      ).join('\n')
    ).join('\n')}

    Keep responses concise and clear, suitable for voice conversation. 
    Focus on the current sales phase: ${salesPhase}.
    Maintain a natural, conversational tone while guiding the discussion toward a sale.`;

    return basePrompt;
  }

  formatCustomerInput(input, context) {
    return `Customer Input: ${input}
    Call Duration: ${context.duration} seconds
    Previous Responses: ${context.customerResponses.slice(-2).join(' -> ')}
    Current Sales Phase: ${context.lastPhase}`;
  }

  async updateAgentMetrics(agent, phase, customerInput) {
    const metrics = {
      callsCompleted: agent.performance.salesMetrics.callsCompleted + 1
    };

    if (phase === 'closing') {
      const success = this.detectSuccessfulClose(customerInput);
      if (success) {
        metrics.conversionRate = (
          (agent.performance.salesMetrics.conversionRate * 
           agent.performance.salesMetrics.callsCompleted + 1) /
          (agent.performance.salesMetrics.callsCompleted + 1)
        );
      }
    }

    await Agent.findByIdAndUpdate(agent._id, {
      $set: { 'performance.salesMetrics': { ...agent.performance.salesMetrics, ...metrics } }
    });
  }

  detectBuyingSignals(responses) {
    const buyingKeywords = [
      'interested', 'when can', 'how soon', 'price', 'cost',
      'payment', 'purchase', 'buy', 'deal', 'sign up'
    ];
    return responses.reduce((count, response) => 
      count + buyingKeywords.filter(keyword => 
        response.toLowerCase().includes(keyword)
      ).length
    , 0);
  }

  detectObjections(responses) {
    const objectionKeywords = [
      'expensive', 'costly', 'not sure', 'think about', 'competitor',
      'too much', 'budget', 'later', 'not now', 'concern'
    ];
    return responses.reduce((count, response) => 
      count + objectionKeywords.filter(keyword => 
        response.toLowerCase().includes(keyword)
      ).length
    , 0);
  }

  detectSuccessfulClose(response) {
    const successKeywords = [
      'yes', 'agree', 'deal', 'sign', 'purchase',
      'buy', 'sold', 'when can we start', 'let\'s do it'
    ];
    return successKeywords.some(keyword => 
      response.toLowerCase().includes(keyword)
    );
  }

  async endCall(callSid) {
    if (!servicesAvailable.twilio) {
      throw new Error('Twilio service is not configured. Please check your environment variables.');
    }

    try {
      await twilioClient.calls(callSid).update({
        status: 'completed'
      });

      return {
        success: true,
        message: 'Call ended successfully'
      };
    } catch (error) {
      console.error('Error ending call:', error);
      throw error;
    }
  }

  getServicesStatus() {
    return {
      voiceEnabled: servicesAvailable.twilio && servicesAvailable.tts,
      twilio: servicesAvailable.twilio,
      textToSpeech: servicesAvailable.tts
    };
  }
}

module.exports = new VoiceService();
