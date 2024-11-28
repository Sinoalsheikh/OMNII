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
    category: String,
    version: Number,
    lastUsed: Date,
    successRate: Number,
    feedback: [{
      rating: Number,
      comment: String,
      timestamp: Date
    }],
    salesPhase: {
      type: String,
      enum: ['introduction', 'discovery', 'presentation', 'handling_objections', 'closing', 'follow_up']
    },
    effectiveness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  productKnowledge: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    proficiency: {
      type: Number,
      default: 80,
      min: 0,
      max: 100
    },
    keyFeatures: [String],
    commonObjections: [{
      objection: String,
      response: String
    }]
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
  skills: [{
    name: String,
    proficiency: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    description: String,
    category: {
      type: String,
      enum: ['technical', 'soft', 'domain', 'language']
    }
  }],
  communication: {
    channels: [{
      type: {
        type: String,
        enum: ['email', 'chat', 'voice', 'video', 'sms']
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance'],
        default: 'active'
      },
      preferences: {
        responseTime: {
          type: Number,
          default: 60  // in seconds
        },
        autoReply: {
          enabled: {
            type: Boolean,
            default: true
          },
          message: String
        },
        workingHours: {
          enabled: {
            type: Boolean,
            default: false
          },
          schedule: [{
            day: {
              type: String,
              enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            start: String,
            end: String
          }]
        }
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
      default: 0,
      history: [{
        value: Number,
        timestamp: Date
      }]
    },
    adaptabilityScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    learningProgress: {
      type: Number,
      default: 0,
      history: [{
        value: Number,
        timestamp: Date,
        milestone: String
      }]
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
    },
    salesMetrics: {
      callsCompleted: {
        type: Number,
        default: 0
      },
      conversionRate: {
        type: Number,
        default: 0
      },
      averageDealSize: {
        type: Number,
        default: 0
      },
      totalRevenue: {
        type: Number,
        default: 0
      },
      objectionHandlingSuccess: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    }
  },
  integrations: [String],
  aiModel: {
    type: String,
    default: 'gpt-4',
    capabilities: [{
      name: String,
      description: String,
      enabled: {
        type: Boolean,
        default: true
      },
      parameters: mongoose.Schema.Types.Mixed
    }],
    knowledgeBase: [{
      name: String,
      description: String,
      content: String,
      category: String,
      lastUpdated: Date
    }],
    trainingData: [{
      type: String,
      data: mongoose.Schema.Types.Mixed,
      timestamp: Date
    }],
    customization: {
      temperature: {
        type: Number,
        default: 0.7,
        min: 0,
        max: 2
      },
      maxTokens: {
        type: Number,
        default: 1000
      },
      topP: {
        type: Number,
        default: 1,
        min: 0,
        max: 1
      }
    }
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
