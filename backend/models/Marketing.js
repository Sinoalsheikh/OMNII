const mongoose = require('mongoose');

const marketingCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'social_media', 'content', 'ppc', 'seo', 'event', 'influencer'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  objective: {
    type: String,
    enum: ['awareness', 'consideration', 'conversion', 'retention'],
    required: true
  },
  targetAudience: {
    demographics: {
      ageRange: {
        min: Number,
        max: Number
      },
      gender: [String],
      location: [String],
      interests: [String]
    },
    segments: [String],
    exclusions: [String]
  },
  budget: {
    total: Number,
    spent: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    breakdown: [{
      channel: String,
      amount: Number,
      spent: Number
    }]
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    timezone: String,
    frequency: String
  },
  content: {
    messages: [{
      platform: String,
      format: String,
      content: String,
      mediaUrls: [String],
      schedule: Date,
      status: String
    }],
    assets: [{
      type: String,
      name: String,
      url: String,
      size: Number,
      format: String
    }]
  },
  performance: {
    reach: Number,
    impressions: Number,
    engagement: {
      likes: Number,
      shares: Number,
      comments: Number,
      clicks: Number
    },
    conversions: {
      leads: Number,
      sales: Number,
      revenue: Number
    },
    roi: Number
  },
  analytics: {
    channelPerformance: [{
      channel: String,
      metrics: mongoose.Schema.Types.Mixed
    }],
    audienceInsights: mongoose.Schema.Types.Mixed,
    conversionFunnel: [{
      stage: String,
      count: Number,
      conversionRate: Number
    }]
  }
});

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['blog', 'video', 'infographic', 'ebook', 'whitepaper', 'case_study', 'social_post'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: [String],
  tags: [String],
  content: {
    body: String,
    summary: String,
    mediaUrls: [String]
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    canonicalUrl: String
  },
  publishing: {
    publishDate: Date,
    updateDate: Date,
    platforms: [{
      name: String,
      url: String,
      status: String
    }]
  },
  performance: {
    views: Number,
    uniqueVisitors: Number,
    averageTimeOnPage: Number,
    bounceRate: Number,
    socialShares: {
      facebook: Number,
      twitter: Number,
      linkedin: Number,
      other: Number
    }
  }
});

const analyticsSchema = new mongoose.Schema({
  period: {
    startDate: Date,
    endDate: Date
  },
  websiteAnalytics: {
    traffic: {
      totalVisits: Number,
      uniqueVisitors: Number,
      pageViews: Number,
      averageSessionDuration: Number,
      bounceRate: Number
    },
    sources: [{
      source: String,
      visits: Number,
      conversions: Number
    }],
    topPages: [{
      url: String,
      views: Number,
      averageTimeOnPage: Number
    }]
  },
  socialMediaAnalytics: {
    platforms: [{
      name: String,
      followers: Number,
      engagement: {
        likes: Number,
        comments: Number,
        shares: Number
      },
      reach: Number,
      impressions: Number
    }],
    topPosts: [{
      platform: String,
      postId: String,
      engagement: Number,
      reach: Number
    }]
  },
  emailAnalytics: {
    campaigns: [{
      campaignId: String,
      sent: Number,
      delivered: Number,
      opened: Number,
      clicked: Number,
      unsubscribed: Number
    }],
    overall: {
      totalSubscribers: Number,
      averageOpenRate: Number,
      averageClickRate: Number,
      growthRate: Number
    }
  },
  conversionAnalytics: {
    leads: {
      total: Number,
      qualified: Number,
      converted: Number,
      conversionRate: Number
    },
    sources: [{
      source: String,
      leads: Number,
      conversions: Number,
      value: Number
    }]
  }
});

// Create indexes
marketingCampaignSchema.index({ status: 1, 'schedule.startDate': 1 });
contentSchema.index({ type: 1, status: 1, 'publishing.publishDate': -1 });
analyticsSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });

// Create models
const MarketingCampaign = mongoose.model('MarketingCampaign', marketingCampaignSchema);
const Content = mongoose.model('Content', contentSchema);
const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = {
  MarketingCampaign,
  Content,
  Analytics
};
