import React, { useState } from 'react';
import { Button, Form, Alert, Card, Container } from 'react-bootstrap';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const navigate = useNavigate(); // ✅ must be inside the component

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        password,
      });

      if (response.status === 200) {
        onLogin(username);
        navigate('/dashboard'); // ✅ use navigate instead of reload
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
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
      }}
    >
      <h1
        className="text-center mb-3"
        style={{
          color: '#efeff1ff',
          fontWeight: '700',
          textShadow: '0px 2px 6px rgba(192, 36, 127, 0.69)',
        }}
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
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleLogin}>
          <Form.Group controlId="formUsername" className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formPassword" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 mt-2">
            Login
          </Button>
        </Form>

        <p className="text-center mt-3 mb-0">
          New user? <Link to="/signup">Sign up here</Link>
        </p>
      </Card>
    </Container>
  );
};

export default Login;
