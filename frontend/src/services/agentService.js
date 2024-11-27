import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

// Add auth token to requests
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const agentService = {
  getAgents: async () => {
    const response = await axios.get(`${API_URL}/api/agents`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  createAgent: async (agentData) => {
    const response = await axios.post(`${API_URL}/api/agents`, agentData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateAgent: async (id, agentData) => {
    const response = await axios.patch(`${API_URL}/api/agents/${id}`, agentData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteAgent: async (id) => {
    const response = await axios.delete(`${API_URL}/api/agents/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  processMessage: async (agentId, message) => {
    const response = await axios.post(`${API_URL}/api/agents/${agentId}/process`, {
      message
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  },
};

export default agentService;
