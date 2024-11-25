




import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import AgentCreationForm from './components/AgentCreationForm';
import AgentList from './components/AgentList';
import Auth from './components/Auth';

function App() {
  const [message, setMessage] = useState('');
  const [agentListKey, setAgentListKey] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetch('http://localhost:5002/api/hello')
        .then(response => response.json())
        .then(data => setMessage(data.message))
        .catch(error => console.error('Error:', error));
    }
  }, [isLoggedIn]);

  const handleAgentCreated = () => {
    setAgentListKey(prevKey => prevKey + 1);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Welcome to OmniFlow.Ai</p>
        {isLoggedIn ? (
          <>
            <p>{message}</p>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Auth onLogin={handleLogin} />
        )}
      </header>
      {isLoggedIn && (
        <main>
          <AgentCreationForm onAgentCreated={handleAgentCreated} />
          <AgentList key={agentListKey} />
        </main>
      )}
    </div>
  );
}

export default App;





