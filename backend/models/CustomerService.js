const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['new', 'assigned', 'in_progress', 'pending', 'resolved', 'closed'],
    default: 'new'
  },
  type: {
    type: String,
    enum: ['question', 'problem', 'feature_request', 'complaint', 'other'],
    required: true
  },
  category: String,
  assignedTo: {
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: Date,
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  timeline: {
    created: {
      type: Date,
      default: Date.now
    },
    firstResponse: Date,
    resolved: Date,
    closed: Date,
    sla: {
      deadline: Date,
      status: {
        type: String,
        enum: ['within', 'at_risk', 'breached'],
        default: 'within'
      }
    }
  },
  interactions: [{
    type: {
      type: String,
      enum: ['note', 'email', 'call', 'chat', 'social'],
      required: true
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true
    },
    content: String,
    attachments: [{
      name: String,
      url: String,
      type: String
    }],
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  resolution: {
    solution: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    feedback: {
      rating: Number,
      comment: String,
      timestamp: Date
    }
  },
  tags: [String],
  metadata: {
    browser: String,
    os: String,
    device: String,
    location: String
  }
});

const knowledgeBaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String],
  metadata: {
    created: {
      type: Date,
      default: Date.now
    },
    lastUpdated: Date,
    publishDate: Date
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  relatedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeBase'
  }],
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  feedback: {
    helpful: {
      type: Number,
      default: 0
    },
    notHelpful: {
      type: Number,
      default: 0
    },
    comments: [{
      content: String,
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: Date
    }]
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueVisitors: {
      type: Number,
      default: 0
    },
    averageTimeSpent: Number,
    searchAppearances: Number
  }
});

const chatSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'waiting', 'transferred', 'ended'],
    default: 'active'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  messages: [{
    sender: {
      type: String,
      enum: ['customer', 'agent', 'system'],
      required: true
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    attachments: [{
      name: String,
      url: String,
      type: String
    }],
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    }
  }],
  metadata: {
    browser: String,
    os: String,
    device: String,
    location: String,
    referrer: String
  },
  feedback: {
    rating: Number,
    comment: String,
    timestamp: Date
  },
  analytics: {
    duration: Number,
    responseTime: Number,
    messageCount: Number,
    resolution: {
      status: String,
      reason: String
    }
  }
});

const feedbackSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  type: {
    type: String,
    enum: ['ticket', 'chat', 'general'],
    required: true
  },
  reference: {
    ticketId: String,
    chatSessionId: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  categories: [{
    name: String,
    rating: Number,
    comment: String
  }],
  comments: String,
  sentiment: {
    score: Number,
    analysis: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'actioned'],
    default: 'new'
  },
  followUp: {
    required: Boolean,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: String,
    notes: String
  }
});

// Create indexes
ticketSchema.index({ status: 1, priority: 1, 'timeline.created': -1 });
knowledgeBaseSchema.index({ category: 1, status: 1, 'metadata.publishDate': -1 });
chatSessionSchema.index({ status: 1, startTime: -1 });
feedbackSchema.index({ type: 1, rating: 1, timestamp: -1 });

// Create models
const Ticket = mongoose.model('Ticket', ticketSchema);
const KnowledgeBase = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = {
  Ticket,
  KnowledgeBase,
  ChatSession,
  Feedback
};
