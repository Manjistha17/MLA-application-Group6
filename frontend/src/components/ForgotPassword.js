import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      setMessage(response.data);
    } catch (err) {
      setError(err.response?.data || 'Failed to send reset link');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="text-center mb-3">Forgot Password</h3>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Button type="submit" className="w-100">
            Send Reset Link
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default ForgotPassword;
