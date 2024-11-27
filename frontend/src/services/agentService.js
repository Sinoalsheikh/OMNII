import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const agentService = {
  getAgents: async () => {
    const response = await axios.get(`${API_URL}/api/agents`);
    return response.data;
  },

  createAgent: async (agentData) => {
    const response = await axios.post(`${API_URL}/api/agents`, agentData);
    return response.data;
  },

  updateAgent: async (id, agentData) => {
    const response = await axios.put(`${API_URL}/api/agents/${id}`, agentData);
    return response.data;
  },

  deleteAgent: async (id) => {
    const response = await axios.delete(`${API_URL}/api/agents/${id}`);
    return response.data;
  },

  processMessage: async (agentId, message) => {
    const response = await axios.post(`${API_URL}/api/chat`, {
      agentId,
      message,
    });
    return response.data;
  },
};

export default agentService;
