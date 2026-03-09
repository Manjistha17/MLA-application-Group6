import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@mui/material';
import '../styles/components/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/forgotPassword', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgotPage">
      <div className="forgotCard">
        <div className="forgotLogo">
          <img src="/logo.png" alt="Shakti 360" className="forgotLogoImg" />
          <span className="forgotLogoText">
            Shakti <span className="forgotLogoBrand">360</span>
          </span>
        </div>

        <div>
          <h1 className="forgotHeading">Forgot your password?</h1>
          <p className="forgotSubheading">No worries! Enter your email and we'll send you a reset link.</p>
        </div>

        {message && (
          <Alert severity="success" sx={{ borderRadius: "10px", fontSize: "14px" }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ borderRadius: "10px", fontSize: "14px" }}>
            {error}
          </Alert>
        )}

        <form className="forgotForm" onSubmit={handleSubmit}>
          <div className="forgotFieldGroup">
            <label className="forgotLabel">Email Address</label>
            <input
              className="forgotInput"
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="forgotSubmitBtn" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="forgotBackLink">
          <button className="forgotLinkBtn" onClick={() => navigate('/')}>
            ← Back to Sign In
          </button>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;