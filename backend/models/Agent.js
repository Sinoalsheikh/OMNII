const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  personality: {
    trait: String,
    communicationStyle: String,
    responseStyle: String
  },
  customization: {
    voiceTone: String,
    decisionMaking: {
      type: String,
      default: 'balanced'
    },
    webhookEnabled: {
      type: Boolean,
      default: false
    }
  },
  scripts: [{
    name: String,
    content: String,
    trigger: String,
    category: String
  }],
  tasks: [{
    title: String,
    description: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    }
  }],
  workflows: [{
    name: String,
    description: String,
    triggers: [{
      event: String,
      conditions: mongoose.Schema.Types.Mixed
    }],
    actions: [{
      type: String,
      parameters: mongoose.Schema.Types.Mixed
    }],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  }],
  skills: [String],
  communication: {
    channels: [{
      type: {
        type: String,
        enum: ['email', 'chat', 'voice']
      },
      status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
      }
    }],
    languages: [{
      code: String,
      proficiency: {
        type: String,
        enum: ['basic', 'intermediate', 'fluent'],
        default: 'fluent'
      }
    }]
  },
  performance: {
    responseTime: {
      type: Number,
      default: 0
    },
    taskCompletionRate: {
      type: Number,
      default: 0
    },
    customerSatisfaction: {
      type: Number,
      default: 0
    },
    accuracyScore: {
      type: Number,
      default: 0
    }
  },
  integrations: [String],
  aiModel: {
    type: String,
    default: 'gpt-4'
  },
  learningRate: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  autonomyLevel: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  communicationSkill: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  problemSolving: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  deployment: {
    autoStart: {
      type: Boolean,
      default: false
    },
    monitoring: {
      type: Boolean,
      default: true
    },
    logging: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
agentSchema.index({ owner: 1 });
agentSchema.index({ 'tasks.status': 1 });
agentSchema.index({ 'workflows.status': 1 });

const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent;
