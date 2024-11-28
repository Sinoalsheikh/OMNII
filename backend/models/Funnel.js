const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['landing', 'upsell', 'downsell', 'checkout', 'thank_you'],
    required: true
  },
  content: {
    headline: String,
    description: String,
    cta: String,
    media: [{
      type: String,
      url: String
    }]
  },
  settings: {
    template: String,
    customCSS: String,
    scripts: [String],
    timerEnabled: Boolean,
    timerDuration: Number
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    price: Number,
    quantity: Number,
    discount: Number
  }],
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    bounceRate: {
      type: Number,
      default: 0
    },
    averageTimeOnPage: {
      type: Number,
      default: 0
    }
  }
});

const funnelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft'
  },
  type: {
    type: String,
    enum: ['sales', 'lead_generation', 'webinar', 'membership'],
    required: true
  },
  steps: [stepSchema],
  settings: {
    domain: String,
    favicon: String,
    brandColors: {
      primary: String,
      secondary: String,
      accent: String
    },
    tracking: {
      googleAnalytics: String,
      facebookPixel: String,
      customScripts: [String]
    },
    emailIntegrations: [{
      provider: String,
      apiKey: String,
      listId: String
    }]
  },
  metrics: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalConversions: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
  },
  ab_tests: [{
    name: String,
    status: {
      type: String,
      enum: ['running', 'completed', 'paused'],
      default: 'running'
    },
    variants: [{
      name: String,
      content: mongoose.Schema.Types.Mixed,
      metrics: {
        views: Number,
        conversions: Number,
        revenue: Number
      }
    }]
  }],
  automation: {
    abandonedCart: {
      enabled: Boolean,
      emailDelay: Number,
      emailTemplate: String
    },
    followUp: [{
      trigger: {
        type: String,
        enum: ['purchase', 'subscription', 'cancellation']
      },
      action: {
        type: String,
        template: String,
        delay: Number
      }
    }]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
funnelSchema.index({ owner: 1, status: 1 });
funnelSchema.index({ 'metrics.totalViews': -1 });
funnelSchema.index({ 'metrics.totalConversions': -1 });

// Pre-save middleware to calculate metrics
funnelSchema.pre('save', function(next) {
  if (this.metrics.totalViews > 0) {
    this.metrics.conversionRate = (this.metrics.totalConversions / this.metrics.totalViews) * 100;
  }
  if (this.metrics.totalConversions > 0) {
    this.metrics.averageOrderValue = this.metrics.revenue / this.metrics.totalConversions;
  }
  next();
});

// Methods
funnelSchema.methods.updateMetrics = async function(stepId, metrics) {
  const step = this.steps.id(stepId);
  if (step) {
    Object.assign(step.metrics, metrics);
    await this.save();
  }
};

funnelSchema.methods.startABTest = async function(testConfig) {
  this.ab_tests.push(testConfig);
  await this.save();
};

funnelSchema.methods.endABTest = async function(testId) {
  const test = this.ab_tests.id(testId);
  if (test) {
    test.status = 'completed';
    await this.save();
  }
};

const Funnel = mongoose.model('Funnel', funnelSchema);

module.exports = Funnel;
