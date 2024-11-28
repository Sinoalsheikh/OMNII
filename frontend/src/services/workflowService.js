import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

// Add auth token to requests
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const workflowService = {
  // Create a new workflow
  createWorkflow: async (workflowData) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/workflows`,
        workflowData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error.response?.data || error;
    }
  },

  // Get all workflows with optional filters
  getWorkflows: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `${API_URL}/api/workflows${queryParams ? `?${queryParams}` : ''}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error.response?.data || error;
    }
  },

  // Get workflow by ID
  getWorkflowById: async (workflowId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/workflows/${workflowId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      throw error.response?.data || error;
    }
  },

  // Update workflow
  updateWorkflow: async (workflowId, updates) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/workflows/${workflowId}`,
        updates,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error.response?.data || error;
    }
  },

  // Delete workflow
  deleteWorkflow: async (workflowId) => {
    try {
      await axios.delete(
        `${API_URL}/api/workflows/${workflowId}`,
        { headers: getAuthHeader() }
      );
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error.response?.data || error;
    }
  },

  // Execute workflow
  executeWorkflow: async (workflowId, context = {}) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/workflows/${workflowId}/execute`,
        { context },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error.response?.data || error;
    }
  },

  // Get workflow performance metrics
  getWorkflowPerformance: async (workflowId, dateRange = {}) => {
    try {
      const queryParams = new URLSearchParams(dateRange).toString();
      const response = await axios.get(
        `${API_URL}/api/workflows/${workflowId}/performance${queryParams ? `?${queryParams}` : ''}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow performance:', error);
      throw error.response?.data || error;
    }
  },

  // Clone workflow
  cloneWorkflow: async (workflowId, newName) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/workflows/${workflowId}/clone`,
        { name: newName },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error cloning workflow:', error);
      throw error.response?.data || error;
    }
  },

  // Get workflow suggestions
  getWorkflowSuggestions: async (description) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/workflows/suggest`,
        { description },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting workflow suggestions:', error);
      throw error.response?.data || error;
    }
  },

  // Helper function to validate workflow data
  validateWorkflowData: (workflowData) => {
    const errors = [];
    
    // Basic validation
    if (!workflowData.name?.trim()) {
      errors.push('Workflow name is required');
    }

    if (!workflowData.category) {
      errors.push('Workflow category is required');
    }

    if (!Array.isArray(workflowData.triggers) || workflowData.triggers.length === 0) {
      errors.push('At least one trigger is required');
    }

    if (!Array.isArray(workflowData.actions) || workflowData.actions.length === 0) {
      errors.push('At least one action is required');
    }

    // Validate triggers
    workflowData.triggers?.forEach((trigger, index) => {
      if (!trigger.event) {
        errors.push(`Trigger ${index + 1}: Event type is required`);
      }
      
      if (trigger.event === 'schedule_time' && !trigger.schedule?.cronExpression) {
        errors.push(`Trigger ${index + 1}: Cron expression is required for scheduled events`);
      }
    });

    // Validate actions
    workflowData.actions?.forEach((action, index) => {
      if (!action.type) {
        errors.push(`Action ${index + 1}: Action type is required`);
      }

      // Validate action parameters based on type
      switch (action.type) {
        case 'send_message':
          if (!action.parameters?.get('message')) {
            errors.push(`Action ${index + 1}: Message content is required`);
          }
          break;
        case 'api_call':
          if (!action.parameters?.get('url')) {
            errors.push(`Action ${index + 1}: API URL is required`);
          }
          break;
        // Add more action type validations as needed
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Get workflow templates
  getWorkflowTemplates: async (category) => {
    try {
      const templates = {
        customer_support: [
          {
            name: 'Customer Inquiry Response',
            description: 'Automatically handle and route customer inquiries',
            triggers: [{ event: 'message_received' }],
            actions: [
              { type: 'send_message', parameters: new Map([['message', 'Thank you for your inquiry']]) },
              { type: 'create_task', parameters: new Map([['priority', 'medium']]) }
            ],
            category: 'customer_support'
          }
        ],
        sales: [
          {
            name: 'Lead Follow-up',
            description: 'Automated lead follow-up sequence',
            triggers: [{ event: 'customer_action' }],
            actions: [
              { type: 'send_message', parameters: new Map([['message', 'Thanks for your interest']]) },
              { type: 'create_task', parameters: new Map([['type', 'follow_up']]) }
            ],
            category: 'sales'
          }
        ]
        // Add more templates for other categories
      };

      return category ? templates[category] : templates;
    } catch (error) {
      console.error('Error fetching workflow templates:', error);
      throw error;
    }
  }
};

export default workflowService;
