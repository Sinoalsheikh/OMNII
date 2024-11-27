const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'transfer', 'investment'],
    required: true
  },
  amount: {
    value: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  category: {
    type: String,
    required: true
  },
  description: String,
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'bank_transfer', 'check', 'other']
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadDate: Date
  }]
});

const budgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  period: {
    startDate: Date,
    endDate: Date
  },
  categories: [{
    name: String,
    allocatedAmount: Number,
    spentAmount: {
      type: Number,
      default: 0
    },
    alerts: [{
      threshold: Number,
      notificationType: {
        type: String,
        enum: ['email', 'notification', 'both']
      },
      status: {
        type: String,
        enum: ['active', 'triggered', 'disabled']
      }
    }]
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'completed'],
    default: 'draft'
  }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  client: {
    name: String,
    email: String,
    address: String,
    taxId: String
  },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    amount: Number,
    tax: Number
  }],
  totalAmount: Number,
  tax: Number,
  dueDate: Date,
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  paymentHistory: [{
    date: Date,
    amount: Number,
    method: String,
    reference: String
  }]
});

const reportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['income_statement', 'balance_sheet', 'cash_flow', 'custom'],
    required: true
  },
  period: {
    startDate: Date,
    endDate: Date
  },
  data: mongoose.Schema.Types.Mixed,
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'error'],
    default: 'generating'
  },
  format: {
    type: String,
    enum: ['pdf', 'excel', 'csv'],
    default: 'pdf'
  }
});

const forecastSchema = new mongoose.Schema({
  name: String,
  period: {
    startDate: Date,
    endDate: Date
  },
  type: {
    type: String,
    enum: ['revenue', 'expense', 'cash_flow'],
    required: true
  },
  predictions: [{
    date: Date,
    amount: Number,
    confidence: Number,
    factors: [{
      name: String,
      impact: Number
    }]
  }],
  aiModel: {
    name: String,
    version: String,
    parameters: mongoose.Schema.Types.Mixed
  },
  accuracy: {
    historical: Number,
    current: Number
  }
});

// Create models
const Transaction = mongoose.model('Transaction', transactionSchema);
const Budget = mongoose.model('Budget', budgetSchema);
const Invoice = mongoose.model('Invoice', invoiceSchema);
const Report = mongoose.model('Report', reportSchema);
const Forecast = mongoose.model('Forecast', forecastSchema);

// Add indexes
transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1, status: 1 });
budgetSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });
invoiceSchema.index({ dueDate: 1, status: 1 });
reportSchema.index({ type: 1, 'period.startDate': 1, 'period.endDate': 1 });

module.exports = {
  Transaction,
  Budget,
  Invoice,
  Report,
  Forecast
};
