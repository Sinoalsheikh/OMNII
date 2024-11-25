


import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import AgentCreationForm from './components/AgentCreationForm';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5002/api/hello')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Welcome to OmniFlow.Ai</p>
        <p>{message}</p>
        <AgentCreationForm />
      </header>
    </div>
  );
}

export default App;



