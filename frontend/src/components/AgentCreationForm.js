

import React, { useState } from 'react';

const AgentCreationForm = ({ onAgentCreated }) => {
  const [agentName, setAgentName] = useState('');
  const [agentRole, setAgentRole] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5002/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: agentName, role: agentRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to create agent');
      }

      const result = await response.json();
      console.log('Agent created:', result);
      setAgentName('');
      setAgentRole('');
      if (onAgentCreated) {
        onAgentCreated(result);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to create agent. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New Agent</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label htmlFor="agentName">Agent Name:</label>
        <input
          type="text"
          id="agentName"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="agentRole">Agent Role:</label>
        <input
          type="text"
          id="agentRole"
          value={agentRole}
          onChange={(e) => setAgentRole(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Agent'}
      </button>
    </form>
  );
};

export default AgentCreationForm;

