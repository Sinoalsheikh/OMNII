const mongoose = require('mongoose');

const commissionTierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  minimumSales: {
    type: Number,
    required: true,
    min: 0
  },
  commissionRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  bonusAmount: {
    type: Number,
    default: 0
  },
  requirements: {
    type: [String],
    default: []
  }
});

const affiliateLinkSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  campaign: {
    type: String,
    trim: true
  },
  utmParameters: {
    source: String,
    medium: String,
    campaign: String,
    term: String,
    content: String
  },
  clicks: {
    type: Number,
    default: 0
  },
  conversions: {
    type: Number,
    default: 0
  },
  lastClicked: Date,
  status: {
    type: String,
    enum: ['active', 'paused', 'expired'],
    default: 'active'
  }
});

const affiliateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  website: {
    type: String,
    trim: true
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String
  },
  marketingMethods: [{
    type: String,
    enum: [
      'social_media',
      'blog',
      'email_marketing',
      'paid_advertising',
      'content_marketing',
      'video_marketing',
      'other'
    ]
  }],
  niche: {
    type: String,
    trim: true
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['paypal', 'bank_transfer', 'stripe'],
      required: true
    },
    email: String,
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      swiftCode: String
    },
    stripeConnectId: String
  },
  commissionTier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommissionTier'
  },
  links: [affiliateLinkSchema],
  metrics: {
    totalClicks: {
      type: Number,
      default: 0
    },
    totalConversions: {
      type: Number,
      default: 0
    },
    totalCommissionEarned: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    }
  },
  performance: {
    currentMonthSales: {
      type: Number,
      default: 0
    },
    lastMonthSales: {
      type: Number,
      default: 0
    },
    totalSales: {
      type: Number,
      default: 0
    }
  },
  payouts: [{
    amount: Number,
    date: Date,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    method: String,
    reference: String
  }],
  referrals: [{
    affiliate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Affiliate'
    },
    date: Date,
    status: String,
    commission: Number
  }],
  documents: [{
    type: {
      type: String,
      enum: ['tax_form', 'id_proof', 'address_proof', 'other'],
      required: true
    },
    name: String,
    url: String,
    uploadDate: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  notifications: {
    email: {
      sales: {
        type: Boolean,
        default: true
      },
      payouts: {
        type: Boolean,
        default: true
      },
      news: {
        type: Boolean,
        default: true
      }
    },
    inApp: {
      sales: {
        type: Boolean,
        default: true
      },
      payouts: {
        type: Boolean,
        default: true
      },
      news: {
        type: Boolean,
        default: true
      }
    }
  },
  marketingMaterials: [{
    type: {
      type: String,
      enum: ['banner', 'email_template', 'landing_page', 'social_post'],
      required: true
    },
    name: String,
    url: String,
    dimensions: String,
    format: String,
    downloadCount: {
      type: Number,
      default: 0
    }
  }],
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
affiliateSchema.index({ user: 1 });
affiliateSchema.index({ status: 1 });
affiliateSchema.index({ 'links.code': 1 });
affiliateSchema.index({ 'metrics.totalCommissionEarned': -1 });

// Pre-save middleware to update metrics
affiliateSchema.pre('save', function(next) {
  if (this.links && this.links.length > 0) {
    // Update total clicks and conversions
    this.metrics.totalClicks = this.links.reduce((sum, link) => sum + link.clicks, 0);
    this.metrics.totalConversions = this.links.reduce((sum, link) => sum + link.conversions, 0);
    
    // Calculate conversion rate
    this.metrics.conversionRate = this.metrics.totalClicks > 0
      ? (this.metrics.totalConversions / this.metrics.totalClicks) * 100
      : 0;
  }
  next();
});

// Instance method to generate new affiliate link
affiliateSchema.methods.generateAffiliateLink = function(campaign = '') {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  this.links.push({
    code,
    campaign,
    utmParameters: {
      source: 'affiliate',
      medium: 'referral',
      campaign: campaign || 'general'
    }
  });
  return code;
};

// Instance method to record a conversion
affiliateSchema.methods.recordConversion = async function(linkCode, amount) {
  const link = this.links.find(l => l.code === linkCode);
  if (link) {
    link.conversions += 1;
    link.lastClicked = new Date();
    this.metrics.totalCommissionEarned += amount;
    this.performance.currentMonthSales += amount;
    this.performance.totalSales += amount;
    await this.save();
    return true;
  }
  return false;
};

const AffiliateProgram = mongoose.model('AffiliateProgram', affiliateSchema);

module.exports = AffiliateProgram;
