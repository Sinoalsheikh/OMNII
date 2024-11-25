


import React, { useState, useEffect } from 'react';

const AgentList = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5002/api/agents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError('Failed to load agents. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <p>Loading agents...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h2>Agent List</h2>
      {agents.length === 0 ? (
        <p>No agents found.</p>
      ) : (
        <ul>
          {agents.map((agent) => (
            <li key={agent._id}>
              <img src={agent.avatar} alt={agent.name} style={{ width: '50px', height: '50px' }} />
              <strong>{agent.name}</strong> - {agent.role}
              <p>Skills: {agent.skills.join(', ')}</p>
              <p>Description: {agent.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AgentList;


