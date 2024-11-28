const express = require('express');
const router = express.Router();
const voiceService = require('../services/voiceService');
const Agent = require('../models/Agent');
const { Customer } = require('../models/Sales');

// Initialize call context storage
const callContexts = new Map();

// Helper methods
const helpers = {
  generateInitialMessage(agent, customer) {
    const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';
    
    let greeting = `Good ${timeOfDay}`;
    if (customer.personalInfo?.firstName) {
      greeting += `, ${customer.personalInfo.firstName}`;
    }
    
    let context = '';
    if (customer.lifecycle?.stage === 'lead') {
      context = `I understand you recently expressed interest in our products`;
    } else if (customer.lifecycle?.stage === 'customer') {
      context = `I hope you're enjoying our products`;
    }
    
    return `${greeting}! This is ${agent.name}, an AI sales representative from OmniFlow. ${context}. I'm calling to discuss how our solutions can help you achieve your goals. How are you today?`;
  },

  generateResponseTwiML(result, context) {
    const baseResponse = `
      <Response>
        <Say>${result.response}</Say>
        <Gather input="speech" timeout="3" action="/api/voice/respond">
    `;

    let prompt = 'Please speak after the tone.';
    if (context.lastPhase === 'closing' && context.metrics.buyingSignals > context.metrics.objections) {
      prompt = 'Would you like to proceed with the purchase?';
    } else if (context.metrics.objections > context.metrics.buyingSignals) {
      prompt = 'Please let me know your concerns so I can address them.';
    }

    return baseResponse + `<Say>${prompt}</Say></Gather></Response>`;
  },

  determineCallOutcome(context) {
    const duration = Math.round(context.duration / 60);
    const buyingSignals = context.metrics.buyingSignals;
    const objections = context.metrics.objections;
    
    let status, summary;
    
    if (buyingSignals > objections * 2) {
      status = 'positive';
      summary = `Successful ${duration}-minute call with strong buying signals. Customer showed high interest.`;
    } else if (buyingSignals > objections) {
      status = 'interested';
      summary = `Promising ${duration}-minute call. Customer showed interest with some objections.`;
    } else if (objections > buyingSignals) {
      status = 'objections';
      summary = `Challenging ${duration}-minute call. Customer raised several concerns.`;
    } else {
      status = 'neutral';
      summary = `Neutral ${duration}-minute call. No clear buying signals or objections.`;
    }
    
    return { status, summary };
  }
};

// Initiate a sales call
router.post('/call', async (req, res) => {
  try {
    const { agentId, customerId, phoneNumber } = req.body;

    // Validate agent and customer
    const agent = await Agent.findOne({ _id: agentId, owner: req.user.userId })
      .populate('productKnowledge.productId');
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const customer = await Customer.findOne({ customerId })
      .populate({
        path: 'assignedTo',
        select: 'name email'
      });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Initialize call context
    const callContext = {
      startTime: Date.now(),
      duration: 0,
      customerResponses: [],
      lastPhase: 'introduction',
      customer: {
        type: customer.type,
        lifecycle: customer.lifecycle,
        previousInteractions: customer.activities || []
      },
      metrics: {
        buyingSignals: 0,
        objections: 0,
        productDiscussions: new Set()
      }
    };

    // Generate personalized initial message based on customer context
    const initialMessage = helpers.generateInitialMessage(agent, customer);

    // Make the call
    const callResult = await voiceService.makeCall(phoneNumber, agent, initialMessage);

    // Store call context
    callContexts.set(callResult.callSid, callContext);

    // Create call record in customer's activities
    await Customer.findByIdAndUpdate(customer._id, {
      $push: {
        activities: {
          type: 'call',
          date: new Date(),
          subject: 'Sales Call',
          description: `Automated sales call initiated by ${agent.name}`,
          outcome: 'in_progress'
        }
      },
      $set: {
        'lifecycle.lastInteraction': new Date()
      }
    });

    res.json({
      success: true,
      callId: callResult.callSid,
      status: callResult.status,
      context: callContext
    });
  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle voice response webhook from Twilio
router.post('/respond', async (req, res) => {
  try {
    const { CallSid, SpeechResult } = req.body;
    
    // Get and update call context
    const callContext = callContexts.get(CallSid);
    if (!callContext) {
      throw new Error('Call context not found');
    }

    // Update context with new response
    callContext.customerResponses.push(SpeechResult);
    callContext.duration = (Date.now() - callContext.startTime) / 1000;

    // Process the response with context
    const result = await voiceService.handleResponse(CallSid, SpeechResult, callContext);

    // Update metrics
    callContext.metrics.buyingSignals += voiceService.detectBuyingSignals([SpeechResult]);
    callContext.metrics.objections += voiceService.detectObjections([SpeechResult]);

    // Update call context
    callContexts.set(CallSid, {
      ...callContext,
      lastPhase: result.nextPhase || callContext.lastPhase
    });

    // Generate dynamic TwiML based on conversation state
    const twiml = helpers.generateResponseTwiML(result, callContext);
    res.type('text/xml').send(twiml);
  } catch (error) {
    console.error('Error handling voice response:', error);
    res.type('text/xml').send(`
      <Response>
        <Say>I apologize, but I'm having trouble processing your response. Let me transfer you to a human agent.</Say>
        <Hangup />
      </Response>
    `);
  }
});

// End a call
router.post('/end', async (req, res) => {
  try {
    const { callId, agentId } = req.body;
    
    // Get final call context
    const callContext = callContexts.get(callId);
    if (!callContext) {
      throw new Error('Call context not found');
    }

    // Update agent metrics
    const agent = await Agent.findById(agentId);
    if (agent) {
      const metrics = {
        callsCompleted: agent.performance.salesMetrics.callsCompleted + 1,
        conversionRate: callContext.metrics.buyingSignals > callContext.metrics.objections 
          ? ((agent.performance.salesMetrics.conversionRate * agent.performance.salesMetrics.callsCompleted) + 1) / (agent.performance.salesMetrics.callsCompleted + 1)
          : agent.performance.salesMetrics.conversionRate
      };

      await Agent.findByIdAndUpdate(agentId, {
        $set: { 'performance.salesMetrics': metrics }
      });
    }

    // Update customer record with call outcome
    const customer = await Customer.findOne({ 'activities.type': 'call', 'activities.date': callContext.startTime });
    if (customer) {
      const callOutcome = helpers.determineCallOutcome(callContext);
      await Customer.findByIdAndUpdate(customer._id, {
        $set: {
          'activities.$.outcome': callOutcome.status,
          'activities.$.description': callOutcome.summary
        }
      });
    }

    // End the call
    const result = await voiceService.endCall(callId);
    
    // Clean up call context
    callContexts.delete(callId);

    res.json({
      ...result,
      metrics: callContext.metrics,
      duration: callContext.duration
    });
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get call status
router.get('/status/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    const call = await voiceService.getCallStatus(callId);
    res.json(call);
  } catch (error) {
    console.error('Error getting call status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
