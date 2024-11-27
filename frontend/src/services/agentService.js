import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

class AgentService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 30000, // 30 second timeout
    });

    // Add request interceptor for auth token and debugging
    this.api.interceptors.request.use((config) => {
      console.log('Starting Request:', config.method.toUpperCase(), config.url);
      
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (error) => {
      console.error('Request Error:', error);
      return Promise.reject(this.handleError(error));
    });

    // Add response interceptor for debugging and error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log('Response:', response.status, response.config.method.toUpperCase(), response.config.url);
        return response;
      },
      (error) => {
        console.error('Response Error:', {
          status: error.response?.status,
          method: error.config?.method?.toUpperCase(),
          url: error.config?.url,
          data: error.response?.data,
          error: error.message
        });
        return Promise.reject(this.handleError(error));
      }
    );
  }

  // Create a new agent
  async createAgent(agentData) {
    try {
      // Validate required fields
      this.validateAgentData(agentData);

      const response = await this.api.post('/agents', agentData);
      return this.processResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all agents
  async getAgents() {
    try {
      const response = await this.api.get('/agents');
      return this.processResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get a specific agent
  async getAgent(id) {
    try {
      if (!id) throw new Error('Agent ID is required');
      
      const response = await this.api.get(`/agents/${id}`);
      return this.processResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update an agent
  async updateAgent(id, agentData) {
    try {
      if (!id) throw new Error('Agent ID is required');
      this.validateAgentData(agentData);

      const response = await this.api.patch(`/agents/${id}`, agentData);
      return this.processResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete an agent
  async deleteAgent(id) {
    try {
      if (!id) throw new Error('Agent ID is required');

      const response = await this.api.delete(`/agents/${id}`);
      return this.processResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Process a message with an agent
  async processMessage(agentId, message) {
    try {
      if (!agentId) throw new Error('Agent ID is required');
      if (!message) throw new Error('Message is required');

      const response = await this.api.post(`/agents/${agentId}/process`, { message });
      return this.processResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Execute a workflow
  async executeWorkflow(agentId, workflowId, context = {}) {
    try {
      if (!agentId) throw new Error('Agent ID is required');
      if (!workflowId) throw new Error('Workflow ID is required');

      const response = await this.api.post(
        `/agents/${agentId}/workflow/${workflowId}`,
        { context }
      );
      return this.processResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Validate agent data
  validateAgentData(agentData) {
    const requiredFields = ['name', 'role'];
    const missingFields = requiredFields.filter(field => !agentData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate personality settings
    if (agentData.personality) {
      const requiredPersonalityFields = ['trait', 'communicationStyle', 'responseStyle'];
      const missingPersonalityFields = requiredPersonalityFields.filter(
        field => !agentData.personality[field]
      );
      
      if (missingPersonalityFields.length > 0) {
        throw new Error(
          `Missing required personality fields: ${missingPersonalityFields.join(', ')}`
        );
      }
    }

    // Validate numeric ranges
    const rangeFields = [
      'learningRate',
      'autonomyLevel',
      'communicationSkill',
      'problemSolving'
    ];

    rangeFields.forEach(field => {
      if (agentData[field] !== undefined) {
        const value = agentData[field];
        if (value < 0 || value > 100) {
          throw new Error(`${field} must be between 0 and 100`);
        }
      }
    });
  }

  // Process API response
  processResponse(response) {
    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    // Handle paginated responses
    if (response.data.items) {
      return {
        items: response.data.items,
        total: response.data.total,
        page: response.data.page,
        pageSize: response.data.pageSize
      };
    }

    // Handle error responses
    if (response.data.error) {
      throw new Error(response.data.error);
    }

    // Handle successful responses
    return response.data;
  }

  // Handle API errors
  handleError(error) {
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.response) {
      // Server responded with error
      errorMessage = error.response.data.error || error.response.statusText;
      errorCode = error.response.status;
    } else if (error.request) {
      // Request made but no response
      errorMessage = 'No response from server';
      errorCode = 'NETWORK_ERROR';
    } else if (error.message) {
      // Error setting up request
      errorMessage = error.message;
      errorCode = error.code || 'REQUEST_ERROR';
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.code = errorCode;
    enhancedError.originalError = error;

    // Add user-friendly message based on error code
    enhancedError.userMessage = this.getUserFriendlyErrorMessage(errorCode);

    return enhancedError;
  }

  // Get user-friendly error message
  getUserFriendlyErrorMessage(errorCode) {
    const errorMessages = {
      400: 'The request was invalid. Please check your input and try again.',
      401: 'Your session has expired. Please log in again.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      429: 'Too many requests. Please try again later.',
      500: 'An internal server error occurred. Please try again later.',
      NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
      REQUEST_ERROR: 'There was a problem with the request. Please try again.',
      UNKNOWN_ERROR: 'An unexpected error occurred. Please try again later.'
    };

    return errorMessages[errorCode] || errorMessages.UNKNOWN_ERROR;
  }

  // Helper method to format dates consistently
  formatDate(date) {
    if (!date) return null;
    return new Date(date).toISOString();
  }

  // Helper method to validate workflow configuration
  validateWorkflow(workflow) {
    if (!workflow.name) {
      throw new Error('Workflow name is required');
    }

    if (!Array.isArray(workflow.actions) || workflow.actions.length === 0) {
      throw new Error('Workflow must have at least one action');
    }

    workflow.actions.forEach((action, index) => {
      if (!action.type) {
        throw new Error(`Action at index ${index} must have a type`);
      }
    });

    return true;
  }
}

export default new AgentService();
