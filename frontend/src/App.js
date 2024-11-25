



import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import AgentCreationForm from './components/AgentCreationForm';
import AgentList from './components/AgentList';

function App() {
  const [message, setMessage] = useState('');
  const [agentListKey, setAgentListKey] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5002/api/hello')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error:', error));
  }, []);

  const handleAgentCreated = () => {
    // Force AgentList to re-render by changing its key
    setAgentListKey(prevKey => prevKey + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Welcome to OmniFlow.Ai</p>
        <p>{message}</p>
      </header>
      <main>
        <AgentCreationForm onAgentCreated={handleAgentCreated} />
        <AgentList key={agentListKey} />
      </main>
    </div>
  );
}

export default App;




