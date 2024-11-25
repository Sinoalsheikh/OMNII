
import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';

const VerifyEmail = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();
  const history = useHistory();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`http://localhost:5002/api/auth/verify-email/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'An error occurred');
        }

        setMessage(data.message);
        setTimeout(() => {
          history.push('/login');
        }, 3000);
      } catch (error) {
        setError(error.message);
      }
    };

    verifyEmail();
  }, [token, history]);

  return (
    <div>
      <h2>Email Verification</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p>Redirecting to login page...</p>}
    </div>
  );
};

export default VerifyEmail;
