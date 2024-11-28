const mongoose = require('mongoose');

const commissionTierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  threshold: {
    type: Number,
    required: true,
    min: 0
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  bonuses: [{
    type: {
      type: String,
      enum: ['fixed', 'percentage']
    },
    amount: Number,
    condition: String
  }]
});

const paymentHistorySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['paypal', 'bank_transfer', 'crypto', 'stripe'],
    required: true
  },
  transactionId: String,
  date: {
    type: Date,
    default: Date.now
  },
  notes: String
}, {
  timestamps: true
});

const affiliateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'terminated'],
    default: 'pending'
  },
  affiliateId: {
    type: String,
    required: true,
    unique: true
  },
  profile: {
    website: String,
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String
    },
    bio: String,
    marketingMethods: [String],
    targetAudience: String
  },
  commissionSettings: {
    defaultRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 10
    },
    tiers: [commissionTierSchema],
    customRates: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      rate: Number
    }],
    cookieDuration: {
      type: Number,
      default: 30,
      min: 1
    }
  },
  tracking: {
    referralLinks: [{
      name: String,
      url: String,
      shortCode: String,
      campaign: String,
      clicks: {
        type: Number,
        default: 0
      },
      conversions: {
        type: Number,
        default: 0
      }
    }],
    customParameters: [{
      name: String,
      value: String
    }]
  },
  performance: {
    totalClicks: {
      type: Number,
      default: 0
    },
    totalConversions: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalCommission: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    monthlyStats: [{
      month: Date,
      clicks: Number,
      conversions: Number,
      revenue: Number,
      commission: Number
    }]
  },
  paymentInfo: {
    preferredMethod: {
      type: String,
      enum: ['paypal', 'bank_transfer', 'crypto', 'stripe']
    },
    paypalEmail: String,
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      swiftCode: String,
      iban: String
    },
    cryptoWallet: {
      type: String,
      currency: String,
      address: String
    },
    stripeConnectedAccountId: String,
    minimumPayout: {
      type: Number,
      default: 100
    },
    paymentSchedule: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
      default: 'monthly'
    }
  },
  paymentHistory: [paymentHistorySchema],
  marketing: {
    materials: [{
      type: String,
      enum: ['banner', 'text_link', 'email_template', 'social_post'],
      name: String,
      url: String,
      dimensions: String,
      downloads: {
        type: Number,
        default: 0
      }
    }],
    approvedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }]
  },
  notifications: {
    email: {
      sales: Boolean,
      payments: Boolean,
      news: Boolean
    },
    sms: {
      sales: Boolean,
      payments: Boolean
    }
  },
  compliance: {
    agreementSigned: Boolean,
    agreementDate: Date,
    taxFormSubmitted: Boolean,
    taxId: String,
    lastReviewDate: Date,
    violations: [{
      date: Date,
      description: String,
      severity: String,
      resolved: Boolean
    }]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
affiliateSchema.index({ affiliateId: 1 });
affiliateSchema.index({ user: 1 });
affiliateSchema.index({ 'performance.totalRevenue': -1 });
affiliateSchema.index({ 'tracking.referralLinks.shortCode': 1 });

// Pre-save middleware to calculate metrics
affiliateSchema.pre('save', function(next) {
  if (this.performance.totalClicks > 0) {
    this.performance.conversionRate = (this.performance.totalConversions / this.performance.totalClicks) * 100;
  }
  next();
});

// Methods
affiliateSchema.methods.generateReferralLink = async function(campaign) {
  const shortCode = Math.random().toString(36).substring(7);
  const referralLink = {
    name: campaign || 'Default Campaign',
    shortCode,
    url: `${process.env.BASE_URL}/ref/${this.affiliateId}/${shortCode}`,
    campaign: campaign || 'default',
    clicks: 0,
    conversions: 0
  };
  
  this.tracking.referralLinks.push(referralLink);
  await this.save();
  return referralLink;
};

affiliateSchema.methods.recordClick = async function(shortCode) {
  const link = this.tracking.referralLinks.find(l => l.shortCode === shortCode);
  if (link) {
    link.clicks++;
    this.performance.totalClicks++;
    await this.save();
  }
};

affiliateSchema.methods.recordConversion = async function(shortCode, amount) {
  const link = this.tracking.referralLinks.find(l => l.shortCode === shortCode);
  if (link) {
    link.conversions++;
    this.performance.totalConversions++;
    this.performance.totalRevenue += amount;
    this.performance.totalCommission += amount * (this.commissionSettings.defaultRate / 100);
    await this.save();
  }
};

const Affiliate = mongoose.model('Affiliate', affiliateSchema);

module.exports = Affiliate;
