


const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  description: {
    type: String,
    trim: true
  },
  personality: {
    type: {
      trait: String,
      communicationStyle: String,
      responseStyle: String
    },
    required: true
  },
  customization: {
    voiceTone: String,
    decisionMaking: {
      type: String,
      enum: ['conservative', 'balanced', 'aggressive'],
      default: 'balanced'
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
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'failed'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    dueDate: Date,
    completedAt: Date
  }],
  workflows: [{
    name: String,
    description: String,
    triggers: [{
      event: String,
      conditions: Object
    }],
    actions: [{
      type: String,
      parameters: Object
    }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'error'],
      default: 'active'
    }
  }],
  performance: {
    responseTime: Number,
    taskCompletionRate: Number,
    customerSatisfaction: Number,
    accuracyScore: Number,
    lastEvaluation: Date
  },
  communication: {
    channels: [{
      type: String,
      status: String,
      lastActive: Date
    }],
    languages: [{
      code: String,
      proficiency: String
    }]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Agent', AgentSchema);


