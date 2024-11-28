import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout Components
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import AgentCreation from './pages/AgentCreation';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import AgentTraining from './pages/AgentTraining';
import Workflows from './pages/Workflows';
import AffiliateDashboard from './pages/AffiliateDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

// Services
import authService from './services/authService';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = authService.getUser();
  
  useEffect(() => {
    console.log('Protected Route Check:', {
      hasToken: !!token,
      user: user,
      isAuthenticated: authService.isAuthenticated()
    });
  }, [token, user]);

  if (!token || !user) {
    console.log('No token or user found, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  return children;
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#0a1929',
      paper: '#132f4c',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  useEffect(() => {
    // Check authentication status on app load
    const token = localStorage.getItem('token');
    const user = authService.getUser();
    console.log('App Authentication Check:', {
      hasToken: !!token,
      user: user,
      isAuthenticated: authService.isAuthenticated()
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={
            authService.isAuthenticated() ? 
              <Navigate to="/" /> : 
              <Login />
          } />
          <Route path="/register" element={
            authService.isAuthenticated() ? 
              <Navigate to="/" /> : 
              <Register />
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/create-agent" element={
            <ProtectedRoute>
              <Layout>
                <AgentCreation />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/chat/:agentId" element={
            <ProtectedRoute>
              <Layout>
                <Chat />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/agent/:agentId/training" element={
            <ProtectedRoute>
              <Layout>
                <AgentTraining />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/workflows" element={
            <ProtectedRoute>
              <Layout>
                <Workflows />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/affiliate" element={
            <ProtectedRoute>
              <Layout>
                <AffiliateDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
