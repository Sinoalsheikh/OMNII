const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['individual', 'business'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect', 'churned'],
    default: 'prospect'
  },
  personalInfo: {
    firstName: String,
    lastName: String,
    email: {
      type: String,
      required: true
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  businessInfo: {
    companyName: String,
    industry: String,
    size: String,
    website: String,
    taxId: String
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String],
  source: String,
  lifecycle: {
    stage: {
      type: String,
      enum: ['lead', 'prospect', 'opportunity', 'customer', 'evangelist'],
      default: 'lead'
    },
    convertedDate: Date,
    lastInteraction: Date
  }
});

const opportunitySchema = new mongoose.Schema({
  opportunityId: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  value: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  stage: {
    type: String,
    enum: ['qualification', 'meeting', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
    default: 'qualification'
  },
  probability: {
    type: Number,
    min: 0,
    max: 100
  },
  expectedCloseDate: Date,
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    price: Number,
    discount: Number
  }],
  activities: [{
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'task']
    },
    subject: String,
    description: String,
    date: Date,
    outcome: String,
    nextSteps: String
  }],
  competitors: [{
    name: String,
    strengths: [String],
    weaknesses: [String],
    status: String
  }]
});

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  category: String,
  price: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  features: [String],
  specifications: mongoose.Schema.Types.Mixed,
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  }
});

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'social', 'event', 'webinar', 'other']
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  target: {
    segments: [String],
    criteria: mongoose.Schema.Types.Mixed
  },
  content: {
    subject: String,
    message: String,
    attachments: [{
      name: String,
      url: String
    }]
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    timezone: String
  },
  metrics: {
    sent: Number,
    delivered: Number,
    opened: Number,
    clicked: Number,
    converted: Number,
    roi: Number
  },
  budget: {
    allocated: Number,
    spent: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  }
});

const quotationSchema = new mongoose.Schema({
  quotationId: {
    type: String,
    required: true,
    unique: true
  },
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    unitPrice: Number,
    discount: Number,
    total: Number
  }],
  totalAmount: Number,
  validUntil: Date,
  terms: String,
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
    default: 'draft'
  },
  notes: String
});

// Create indexes
customerSchema.index({ 'personalInfo.email': 1 });
customerSchema.index({ 'lifecycle.stage': 1 });
opportunitySchema.index({ stage: 1, expectedCloseDate: 1 });
productSchema.index({ category: 1, status: 1 });
campaignSchema.index({ status: 1, 'schedule.startDate': 1 });

// Create models
const Customer = mongoose.model('Customer', customerSchema);
const Opportunity = mongoose.model('Opportunity', opportunitySchema);
const Product = mongoose.model('Product', productSchema);
const Campaign = mongoose.model('Campaign', campaignSchema);
const Quotation = mongoose.model('Quotation', quotationSchema);

module.exports = {
  Customer,
  Opportunity,
  Product,
  Campaign,
  Quotation
};
