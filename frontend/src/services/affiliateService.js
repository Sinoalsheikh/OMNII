import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

// Add auth token to requests
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const affiliateService = {
  // Apply to become an affiliate
  applyForProgram: async (affiliateData) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/affiliates/apply`,
        affiliateData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error applying for affiliate program:', error);
      throw error.response?.data || error;
    }
  },

  // Get affiliate profile
  getProfile: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/affiliates/profile`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching affiliate profile:', error);
      throw error.response?.data || error;
    }
  },

  // Update affiliate profile
  updateProfile: async (updates) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/affiliates/profile`,
        updates,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating affiliate profile:', error);
      throw error.response?.data || error;
    }
  },

  // Generate new affiliate link
  generateLink: async (campaign = '') => {
    try {
      const response = await axios.post(
        `${API_URL}/api/affiliates/links`,
        { campaign },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating affiliate link:', error);
      throw error.response?.data || error;
    }
  },

  // Get affiliate metrics
  getMetrics: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/affiliates/metrics`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching affiliate metrics:', error);
      throw error.response?.data || error;
    }
  },

  // Get affiliate analytics
  getAnalytics: async (dateRange = {}) => {
    try {
      const params = new URLSearchParams(dateRange).toString();
      const response = await axios.get(
        `${API_URL}/api/affiliates/analytics${params ? `?${params}` : ''}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching affiliate analytics:', error);
      throw error.response?.data || error;
    }
  },

  // Upload marketing material
  uploadMarketingMaterial: async (type, file) => {
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('file', file);

      const response = await axios.post(
        `${API_URL}/api/affiliates/marketing-materials`,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading marketing material:', error);
      throw error.response?.data || error;
    }
  },

  // Request payout
  requestPayout: async (amount, method) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/affiliates/payouts/request`,
        { amount, method },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error requesting payout:', error);
      throw error.response?.data || error;
    }
  },

  // Get payout history
  getPayoutHistory: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/affiliates/payouts`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching payout history:', error);
      throw error.response?.data || error;
    }
  },

  // Upload required documents
  uploadDocument: async (type, file) => {
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('document', file);

      const response = await axios.post(
        `${API_URL}/api/affiliates/documents`,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error.response?.data || error;
    }
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/affiliates/notifications`,
        preferences,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error.response?.data || error;
    }
  },

  // Helper function to format affiliate link
  formatAffiliateLink: (code) => {
    return `${window.location.origin}?ref=${code}`;
  },

  // Helper function to validate commission calculations
  validateCommission: (amount, tier) => {
    if (!amount || amount <= 0) return 0;
    
    const rates = {
      basic: 0.1, // 10%
      silver: 0.15, // 15%
      gold: 0.2, // 20%
      platinum: 0.25 // 25%
    };

    return amount * (rates[tier] || rates.basic);
  },

  // Helper function to generate marketing suggestions
  generateMarketingSuggestions: async (niche, marketingMethods) => {
    try {
      // This would typically call an AI endpoint for personalized suggestions
      return {
        suggestedContent: [],
        targetAudience: [],
        marketingChannels: [],
        promotionalStrategies: []
      };
    } catch (error) {
      console.error('Error generating marketing suggestions:', error);
      throw error;
    }
  },

  // Helper function to analyze link performance
  analyzeLinkPerformance: (links, dateRange = {}) => {
    const metrics = {
      totalClicks: 0,
      totalConversions: 0,
      conversionRate: 0,
      topPerforming: null,
      recentActivity: []
    };

    if (!links || links.length === 0) return metrics;

    links.forEach(link => {
      metrics.totalClicks += link.clicks;
      metrics.totalConversions += link.conversions;
    });

    metrics.conversionRate = metrics.totalClicks > 0
      ? (metrics.totalConversions / metrics.totalClicks) * 100
      : 0;

    metrics.topPerforming = links.reduce((prev, current) => 
      (current.conversions > prev.conversions) ? current : prev
    );

    return metrics;
  }
};

export default affiliateService;
