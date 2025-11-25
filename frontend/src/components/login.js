import React, { useState, useRef } from 'react';
import { Button, Form, Alert, Card, Container, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // New state for loading/spinner
  
  // 💡 Accessibility Improvement: Ref to set initial focus for keyboard users
  const usernameInputRef = useRef(null);

  // 💡 Accessibility Improvement: Set focus on component mount
  React.useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  // 💡 Accessibility Improvement: Set focus on error for screen reader users
  React.useEffect(() => {
    if (error) {
      // Announce the error immediately
      const errorAlert = document.getElementById('login-error-alert');
      if (errorAlert) {
        // Optional: Move focus to the global error message for immediate announcement
        errorAlert.focus(); 
      }
    }
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic Client-Side Validation (for cognitive/visual disabilities)
    if (!username.trim() || !password.trim()) {
        setError('Please enter both username and password.');
        return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });

      if (response.status === 200) {
        onLogin(username);
        navigate('/dashboard');
      } else {
        // Should ideally be caught by axios error handler unless status is 4xx/5xx but no exception is thrown
        setError('Invalid credentials.');
      }
    } catch (err) {
        const serverMessage = err?.response?.data?.message || err?.response?.data || 'Failed to login. Please check your credentials.';
        setError(typeof serverMessage === 'string' ? serverMessage : 'Login error. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: "url('/login_box.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        // 💡 Accessibility Improvement: Ensure background content has sufficient contrast
      }}
    >
      {/* 💡 Accessibility Improvement: Added role="heading" and aria-level for context */}
      <h1
        className="text-center mb-3"
        style={{
          color: '#efeff1ff',
          fontWeight: '700',
          textShadow: '0px 2px 6px rgba(192, 36, 127, 0.69)',
        }}
        role="heading"
        aria-level="1"
      >
        Welcome to the MLA Fitness App!
      </h1>

      <Card
        className="p-4 shadow-sm"
        style={{
          maxWidth: '400px',
          width: '100%',
          borderRadius: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
        }}
      >
        {/* 💡 Accessibility Improvement: Added role="alert" and tabIndex="-1" to force focus/announce */}
        {error && 
          <Alert 
            variant="danger" 
            role="alert" 
            tabIndex="-1" 
            id="login-error-alert"
          >
            {error}
          </Alert>
        }

        <Form onSubmit={handleLogin} noValidate>
          <Form.Group controlId="formUsername" className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required // 💡 Added native required attribute
              ref={usernameInputRef} // Set ref for initial focus
              aria-required="true" // 💡 Added ARIA required
              autoComplete="username" // 💡 Added autocomplete for cognitive/motor disabilities
            />
          </Form.Group>

          <Form.Group controlId="formPassword" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required // 💡 Added native required attribute
              aria-required="true" // 💡 Added ARIA required
              autoComplete="current-password" // 💡 Added autocomplete for cognitive/motor disabilities
            />
          </Form.Group>

          {/* 💡 Accessibility Improvement: Added loading state with ARIA attributes */}
          <Button 
            variant="primary" 
            type="submit" 
            className="w-100 mt-2"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                {' '}Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>

            {/* Forgot password link */}
          <p className="text-center mt-2 mb-0">
            <Link to="/forgotPassword">Forgot Password?</Link>
          </p>
        </Form>

        <p className="text-center mt-3 mb-0">
          New user? <Link to="/signup">Sign up here</Link>
        </p>
      </Card>
    </Container>
  );
};

export default Login;