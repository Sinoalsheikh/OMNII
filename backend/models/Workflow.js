const mongoose = require('mongoose');

const triggerSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    enum: [
      'message_received',
      'task_completed',
      'schedule_time',
      'customer_action',
      'data_threshold',
      'api_webhook'
    ]
  },
  conditions: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  schedule: {
    cronExpression: String,
    timezone: String
  }
});

const actionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'send_message',
      'create_task',
      'update_data',
      'notify_user',
      'api_call',
      'assign_agent',
      'escalate_issue',
      'generate_report'
    ]
  },
  parameters: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  retryConfig: {
    maxAttempts: {
      type: Number,
      default: 3
    },
    backoffMultiplier: {
      type: Number,
      default: 2
    }
  }
});

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  }],
  triggers: [triggerSchema],
  actions: [actionSchema],
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  executionOrder: {
    type: String,
    enum: ['sequential', 'parallel'],
    default: 'sequential'
  },
  errorHandling: {
    continueOnError: {
      type: Boolean,
      default: false
    },
    notifyOnError: {
      type: Boolean,
      default: true
    },
    errorMessage: String
  },
  metrics: {
    totalExecutions: {
      type: Number,
      default: 0
    },
    successfulExecutions: {
      type: Number,
      default: 0
    },
    failedExecutions: {
      type: Number,
      default: 0
    },
    averageExecutionTime: {
      type: Number,
      default: 0
    },
    lastExecutionTime: Date
  },
  version: {
    type: Number,
    default: 1
  },
  tags: [String],
  category: {
    type: String,
    enum: [
      'customer_support',
      'sales',
      'marketing',
      'operations',
      'hr',
      'finance',
      'other'
    ],
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
workflowSchema.index({ owner: 1, status: 1 });
workflowSchema.index({ 'triggers.event': 1 });
workflowSchema.index({ category: 1 });

// Pre-save middleware to validate workflow logic
workflowSchema.pre('save', function(next) {
  // Ensure at least one trigger and action exist
  if (!this.triggers.length || !this.actions.length) {
    next(new Error('Workflow must have at least one trigger and one action'));
    return;
  }

  // Validate schedule if trigger type is schedule_time
  const scheduleTriggersValid = this.triggers.every(trigger => {
    if (trigger.event === 'schedule_time' && !trigger.schedule?.cronExpression) {
      next(new Error('Schedule triggers must include a valid cron expression'));
      return false;
    }
    return true;
  });

  if (!scheduleTriggersValid) return;

  // Validate action parameters based on action type
  const actionsValid = this.actions.every(action => {
    switch (action.type) {
      case 'send_message':
        if (!action.parameters.get('message')) {
          next(new Error('Send message action must include message content'));
          return false;
        }
        break;
      case 'api_call':
        if (!action.parameters.get('url')) {
          next(new Error('API call action must include URL'));
          return false;
        }
        break;
      // Add more action type validations as needed
    }
    return true;
  });

  if (!actionsValid) return;

  next();
});

// Instance method to execute the workflow
workflowSchema.methods.execute = async function(context) {
  const startTime = Date.now();
  let success = true;

  try {
    // Execute actions based on execution order
    if (this.executionOrder === 'sequential') {
      for (const action of this.actions) {
        await this.executeAction(action, context);
      }
    } else {
      await Promise.all(
        this.actions.map(action => this.executeAction(action, context))
      );
    }

    // Update metrics
    this.metrics.totalExecutions++;
    this.metrics.successfulExecutions++;
    this.metrics.lastExecutionTime = new Date();
    
    const executionTime = Date.now() - startTime;
    this.metrics.averageExecutionTime = (
      (this.metrics.averageExecutionTime * (this.metrics.totalExecutions - 1) + executionTime) /
      this.metrics.totalExecutions
    );

  } catch (error) {
    success = false;
    this.metrics.totalExecutions++;
    this.metrics.failedExecutions++;
    this.metrics.lastExecutionTime = new Date();

    if (this.errorHandling.notifyOnError) {
      // Implement error notification logic
    }

    if (!this.errorHandling.continueOnError) {
      throw error;
    }
  }

  await this.save();
  return success;
};

// Helper method to execute a single action
workflowSchema.methods.executeAction = async function(action, context) {
  let attempts = 0;
  let lastError;

  while (attempts < action.retryConfig.maxAttempts) {
    try {
      switch (action.type) {
        case 'send_message':
          // Implement message sending logic
          break;
        case 'create_task':
          // Implement task creation logic
          break;
        case 'api_call':
          // Implement API call logic
          break;
        // Add more action type implementations
      }
      return true;
    } catch (error) {
      lastError = error;
      attempts++;
      if (attempts < action.retryConfig.maxAttempts) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(action.retryConfig.backoffMultiplier, attempts) * 1000)
        );
      }
    }
  }

  throw lastError;
};

const Workflow = mongoose.model('Workflow', workflowSchema);

module.exports = Workflow;
