
import React, { useState } from 'react';

const AgentCreationForm = () => {
  const [agentName, setAgentName] = useState('');
  const [agentRole, setAgentRole] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5002/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: agentName, role: agentRole }),
      });
      if (response.ok) {
        const result = await response.json();
        console.log('Agent created:', result);
        // Reset form
        setAgentName('');
        setAgentRole('');
      } else {
        console.error('Failed to create agent');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New Agent</h2>
      <div>
        <label htmlFor="agentName">Agent Name:</label>
        <input
          type="text"
          id="agentName"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          required
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
        />
      </div>
      <button type="submit">Create Agent</button>
    </form>
  );
};

export default AgentCreationForm;
