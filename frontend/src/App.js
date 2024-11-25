








import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import AgentCreationForm from './components/AgentCreationForm';
import AgentList from './components/AgentList';
import Auth from './components/Auth';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import VerifyEmail from './components/VerifyEmail';
import UserProfile from './components/UserProfile';

function App() {
  const [message, setMessage] = useState('');
  const [agentListKey, setAgentListKey] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
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

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserRole('');
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>Welcome to OmniFlow.Ai</p>
          {isLoggedIn ? (
            <>
              <p>{message}</p>
              <p>Role: {userRole}</p>
              <nav>
                <Link to="/profile">Profile</Link> | 
                <Link to="/agents">Agents</Link>
                {userRole === 'admin' && (
                  <> | <Link to="/create-agent">Create Agent</Link></>
                )}
              </nav>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <nav>
              <Link to="/login">Login</Link> | 
              <Link to="/register">Register</Link> | 
              <Link to="/forgot-password">Forgot Password</Link>
            </nav>
          )}
        </header>
        <main>
          <Switch>
            <Route path="/login">
              <Auth onLogin={handleLogin} />
            </Route>
            <Route path="/register">
              <Auth onLogin={handleLogin} isRegister={true} />
            </Route>
            <Route path="/forgot-password">
              <ForgotPassword />
            </Route>
            <Route path="/reset-password/:resetToken">
              <ResetPassword />
            </Route>
            <Route path="/verify-email/:token">
              <VerifyEmail />
            </Route>
            {isLoggedIn && (
              <>
                <Route path="/profile">
                  <UserProfile />
                </Route>
                {userRole === 'admin' && (
                  <Route path="/create-agent">
                    <AgentCreationForm onAgentCreated={handleAgentCreated} />
                  </Route>
                )}
                <Route path="/agents">
                  <AgentList key={agentListKey} />
                </Route>
              </>
            )}
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;









