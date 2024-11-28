import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

// Add auth token to requests
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const trainingService = {
  // Submit training data for an agent
  submitTraining: async (agentId, trainingData, customInstructions) => {
    const formData = new FormData();
    const trainingBlob = new Blob([JSON.stringify(trainingData)], {
      type: 'application/json'
    });
    
    formData.append('trainingData', trainingBlob, 'training.json');
    formData.append('customInstructions', customInstructions);

    const response = await axios.post(
      `${API_URL}/api/training/${agentId}/train`,
      formData,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  // Get training status
  getTrainingStatus: async (agentId, jobId) => {
    const response = await axios.get(
      `${API_URL}/api/training/${agentId}/training/${jobId}`,
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  },

  // Get training history
  getTrainingHistory: async (agentId) => {
    const response = await axios.get(
      `${API_URL}/api/training/${agentId}/history`,
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  },

  // Validate training data format
  validateTrainingData: (data) => {
    if (!Array.isArray(data)) {
      throw new Error('Training data must be an array of examples');
    }

    const validFormat = data.every(example => {
      return (
        example.hasOwnProperty('input') &&
        example.hasOwnProperty('output') &&
        typeof example.input === 'string' &&
        typeof example.output === 'string'
      );
    });

    if (!validFormat) {
      throw new Error('Each training example must have "input" and "output" fields as strings');
    }

    return true;
  },

  // Generate sample training data template
  getSampleTemplate: () => {
    return [
      {
        input: "What's your return policy?",
        output: "Our standard return policy allows returns within 30 days of purchase with original receipt. Items must be unused and in original packaging."
      },
      {
        input: "How do I track my order?",
        output: "You can track your order by logging into your account and visiting the order history section. There you'll find your tracking number and current shipment status."
      }
    ];
  },

  // Monitor training progress
  monitorTrainingProgress: async (agentId, jobId, onProgress) => {
    const checkStatus = async () => {
      try {
        const status = await trainingService.getTrainingStatus(agentId, jobId);
        
        if (onProgress) {
          onProgress(status);
        }

        if (status.status === 'completed' || status.status === 'failed') {
          return status;
        }

        // Continue checking every 30 seconds
        await new Promise(resolve => setTimeout(resolve, 30000));
        return checkStatus();
      } catch (error) {
        console.error('Error monitoring training progress:', error);
        throw error;
      }
    };

    return checkStatus();
  },

  // Download training history
  downloadTrainingHistory: async (agentId) => {
    const history = await trainingService.getTrainingHistory(agentId);
    const blob = new Blob([JSON.stringify(history, null, 2)], {
      type: 'application/json'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training_history_${agentId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
};

export default trainingService;
