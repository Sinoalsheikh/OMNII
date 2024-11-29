const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  traits: {
    type: String,
    required: true,
    enum: ['friendly', 'professional', 'casual'],
    default: 'friendly'
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  aiModel: {
    type: String,
    default: 'gpt-3.5-turbo'
  }
}, {
  timestamps: true
});

// Add index for better query performance
agentSchema.index({ owner: 1 });

const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent;
