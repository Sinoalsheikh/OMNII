const AffiliateProgram = require('../models/AffiliateProgram');
const { openai } = require('../config/openai');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY); // Log the Stripe secret key for debugging
console.log('Initializing Stripe with key:', process.env.STRIPE_SECRET_KEY); // Log the Stripe secret key for debugging
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class AffiliateService {
  async createAffiliate(userId, affiliateData) {
    try {
      // Check if user already has an affiliate account
      const existingAffiliate = await AffiliateProgram.findOne({ user: userId });
      if (existingAffiliate) {
        throw new Error('User already has an affiliate account');
      }

      // Create new affiliate account
      const affiliate = new AffiliateProgram({
        user: userId,
        ...affiliateData
      });

      // Generate initial affiliate link
      affiliate.generateAffiliateLink();

      await affiliate.save();
      return affiliate;
    } catch (error) {
      console.error('Error creating affiliate:', error);
      throw error;
    }
  }

  async getAffiliateByUser(userId) {
    try {
      const affiliate = await AffiliateProgram.findOne({ user: userId })
        .populate('user', 'name email')
        .populate('referrals.affiliate', 'user');
      
      if (!affiliate) {
        throw new Error('Affiliate not found');
      }

      return affiliate;
    } catch (error) {
      console.error('Error fetching affiliate:', error);
      throw error;
    }
  }

  async updateAffiliate(userId, updates) {
    try {
      const affiliate = await AffiliateProgram.findOneAndUpdate(
        { user: userId },
        updates,
        { new: true, runValidators: true }
      );

      if (!affiliate) {
        throw new Error('Affiliate not found');
      }

      return affiliate;
    } catch (error) {
      console.error('Error updating affiliate:', error);
      throw error;
    }
  }

  async generateAffiliateLink(userId, campaign = '') {
    try {
      const affiliate = await this.getAffiliateByUser(userId);
      const code = affiliate.generateAffiliateLink(campaign);
      await affiliate.save();
      return {
        code,
        fullUrl: `${process.env.FRONTEND_URL}?ref=${code}`
      };
    } catch (error) {
      console.error('Error generating affiliate link:', error);
      throw error;
    }
  }

  async trackClick(linkCode) {
    try {
      const affiliate = await AffiliateProgram.findOne({ 'links.code': linkCode });
      if (!affiliate) {
        throw new Error('Invalid affiliate link');
      }

      const link = affiliate.links.find(l => l.code === linkCode);
      if (link) {
        link.clicks += 1;
        link.lastClicked = new Date();
        await affiliate.save();
      }

      return true;
    } catch (error) {
      console.error('Error tracking click:', error);
      throw error;
    }
  }

  async recordConversion(linkCode, amount) {
    try {
      const affiliate = await AffiliateProgram.findOne({ 'links.code': linkCode });
      if (!affiliate) {
        throw new Error('Invalid affiliate link');
      }

      await affiliate.recordConversion(linkCode, amount);
      return true;
    } catch (error) {
      console.error('Error recording conversion:', error);
      throw error;
    }
  }

  async getAffiliateMetrics(userId) {
    try {
      const affiliate = await this.getAffiliateByUser(userId);
      
      // Calculate additional metrics
      const metrics = {
        ...affiliate.metrics,
        recentActivity: await this.getRecentActivity(affiliate._id),
        projectedEarnings: await this.calculateProjectedEarnings(affiliate._id),
        performanceTrends: await this.analyzePerformanceTrends(affiliate._id)
      };

      return metrics;
    } catch (error) {
      console.error('Error fetching affiliate metrics:', error);
      throw error;
    }
  }

  async getRecentActivity(affiliateId, days = 30) {
    try {
      const affiliate = await AffiliateProgram.findById(affiliateId);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const activity = affiliate.links.map(link => ({
        code: link.code,
        campaign: link.campaign,
        clicks: link.clicks,
        conversions: link.conversions,
        lastClicked: link.lastClicked
      })).filter(link => link.lastClicked > startDate);

      return activity;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  async calculateProjectedEarnings(affiliateId) {
    try {
      const affiliate = await AffiliateProgram.findById(affiliateId);
      
      // Calculate average daily earnings
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentPayouts = affiliate.payouts
        .filter(payout => payout.date > thirtyDaysAgo)
        .reduce((sum, payout) => sum + payout.amount, 0);
      
      const averageDailyEarnings = recentPayouts / 30;
      
      // Project next month's earnings
      return {
        nextMonth: averageDailyEarnings * 30,
        nextQuarter: averageDailyEarnings * 90,
        potential: averageDailyEarnings * 30 * 1.5 // Assuming 50% growth potential
      };
    } catch (error) {
      console.error('Error calculating projected earnings:', error);
      throw error;
    }
  }

  async analyzePerformanceTrends(affiliateId) {
    try {
      const affiliate = await AffiliateProgram.findById(affiliateId);
      
      // Analyze last 6 months of performance
      const trends = {
        clicks: [],
        conversions: [],
        earnings: []
      };

      for (let i = 0; i < 6; i++) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);
        
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        
        const monthlyPayouts = affiliate.payouts
          .filter(payout => payout.date >= monthStart && payout.date < monthEnd)
          .reduce((sum, payout) => sum + payout.amount, 0);
        
        trends.earnings.unshift(monthlyPayouts);
      }

      return trends;
    } catch (error) {
      console.error('Error analyzing performance trends:', error);
      throw error;
    }
  }

  async processPayouts(affiliateId) {
    try {
      const affiliate = await AffiliateProgram.findById(affiliateId);
      
      if (affiliate.paymentInfo.method === 'stripe' && affiliate.paymentInfo.stripeConnectId) {
        // Process payout through Stripe Connect
        const transfer = await stripe.transfers.create({
          amount: Math.floor(affiliate.metrics.totalCommissionEarned * 100), // Convert to cents
          currency: 'usd',
          destination: affiliate.paymentInfo.stripeConnectId
        });

        // Record payout
        affiliate.payouts.push({
          amount: affiliate.metrics.totalCommissionEarned,
          date: new Date(),
          status: 'completed',
          method: 'stripe',
          reference: transfer.id
        });

        // Reset commission balance
        affiliate.metrics.totalCommissionEarned = 0;
        
        await affiliate.save();
        return transfer;
      }

      throw new Error('Unsupported payment method');
    } catch (error) {
      console.error('Error processing payout:', error);
      throw error;
    }
  }

  async generateMarketingMaterials(affiliateId, type) {
    try {
      const affiliate = await AffiliateProgram.findById(affiliateId);
      
      // Generate marketing content using AI
      const prompt = `Generate marketing content for an affiliate promoting OmniFlow.AI.
      Type: ${type}
      Niche: ${affiliate.niche}
      Target audience: Business professionals interested in AI automation
      Key benefits to highlight:
      1. AI-powered workflow automation
      2. Custom virtual agents
      3. Seamless integrations
      4. Advanced analytics`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      });

      const content = completion.choices[0].message.content;

      // Save marketing material
      affiliate.marketingMaterials.push({
        type,
        name: `${type}_${Date.now()}`,
        url: content, // In a real implementation, this would be a URL to the generated asset
        format: 'text'
      });

      await affiliate.save();

      return {
        content,
        material: affiliate.marketingMaterials[affiliate.marketingMaterials.length - 1]
      };
    } catch (error) {
      console.error('Error generating marketing materials:', error);
      throw error;
    }
  }

  async getAffiliateAnalytics(affiliateId) {
    try {
      const affiliate = await AffiliateProgram.findById(affiliateId);
      
      // Gather comprehensive analytics
      const analytics = {
        overview: {
          totalEarnings: affiliate.metrics.totalCommissionEarned,
          conversionRate: affiliate.metrics.conversionRate,
          activeLinks: affiliate.links.filter(link => link.status === 'active').length
        },
        traffic: {
          sources: await this.analyzeTrafficSources(affiliate),
          geography: await this.analyzeGeographicData(affiliate),
          devices: await this.analyzeDeviceData(affiliate)
        },
        performance: {
          trends: await this.analyzePerformanceTrends(affiliateId),
          campaigns: await this.analyzeCampaignPerformance(affiliate),
          comparison: await this.compareToAverages(affiliate)
        }
      };

      return analytics;
    } catch (error) {
      console.error('Error fetching affiliate analytics:', error);
      throw error;
    }
  }

  // Helper methods for analytics
  async analyzeTrafficSources(affiliate) {
    // Implementation would analyze UTM parameters and referral data
    return {};
  }

  async analyzeGeographicData(affiliate) {
    // Implementation would analyze geographic distribution of clicks/conversions
    return {};
  }

  async analyzeDeviceData(affiliate) {
    // Implementation would analyze device types used by referrals
    return {};
  }

  async analyzeCampaignPerformance(affiliate) {
    // Implementation would analyze performance by campaign
    return {};
  }

  async compareToAverages(affiliate) {
    // Implementation would compare performance to program averages
    return {};
  }
}

module.exports = new AffiliateService();
