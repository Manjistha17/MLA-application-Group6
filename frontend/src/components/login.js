import React, { useState } from 'react';
import { Button, Form, Alert, Card, Container } from 'react-bootstrap';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors before a new attempt

    // Basic client-side validation for immediate feedback
    if (!username || !password) {
        setError('Please enter both username and password.');
        return;
    }

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });

      if (response.status === 200) {
        onLogin(username);
        navigate('/profile');
      } else {
        // More specific error handling if the API provides it
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      // Use role="alert" in the component below for immediate announcement
      setError('Failed to login. Please check your credentials and network connection.');
    }
  };

  return (
    // 1. Accessibility: Use role="main" for the primary content area
    <Container
      fluid
      className="d-flex flex-column justify-content-center align-items-center vh-100"
      // Remove background image/styles if they compromise text readability (Cognitive/Visual)
      // For this example, we'll keep the styles but use a strong background for contrast.
      style={{
        backgroundImage: "url('/login_box.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        // Adding a fallback color or overlay for better contrast
      }}
      role="main"
      aria-label="Login Page" // Provides context for screen readers on initial page load
    >
      {/* 2. Accessibility: Ensure heading provides clear context */}
      <h1
        className="text-center mb-3"
        style={{
          color: '#efeff1ff',
          fontWeight: '700',
          textShadow: '0px 2px 6px rgba(192, 36, 127, 0.69)',
          // Add a dark overlay or backdrop for improved contrast against the background image
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '10px 20px',
          borderRadius: '5px',
        }}
        tabIndex="-1" // Allow programatic focus to announce the page title (simulates a typical focus management pattern)
      >
        Welcome to the MLA Fitness App!
      </h1>

      <Card
        className="p-4 shadow-sm"
        style={{
          maxWidth: '400px',
          width: '100%',
          borderRadius: '10px',
          // Increased opacity for better text contrast (Visual/Cognitive)
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        {/* 3. Accessibility: Use role="alert" for dynamic error messages */}
        {error && <Alert variant="danger" role="alert" aria-live="assertive">{error}</Alert>}

        <Form onSubmit={handleLogin}>
          <Form.Group controlId="formUsername" className="mb-3">
            {/* 4. Accessibility: Form.Label is correctly associated with Form.Control via controlId (essential for screen readers) */}
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              // 5. Accessibility: aria-required for required fields (though browser validation helps)
              aria-required="true"
              autoComplete="username" // 6. Accessibility: Autocomplete for cognitive/motor aid
            />
          </Form.Group>

          <Form.Group controlId="formPassword" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-required="true"
              autoComplete="current-password" // 6. Accessibility: Autocomplete for cognitive/motor aid
            />
          </Form.Group>

          {/* 7. Accessibility: Button has clear, focusable text. Keyboard focus is automatic. */}
          <Button variant="primary" type="submit" className="w-100 mt-2">
            Login
          </Button>
        </Form>

        <p className="text-center mt-3 mb-0">
          New user? <Link to="/signup">Sign up here</Link>
          {/* 8. Accessibility: The Link is focusable and the text is clear (Sign up here) */}
        </p>
      </Card>
    </Container>
  );
};

export default Login;