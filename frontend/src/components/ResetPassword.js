import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // get token from URL
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const response = await axios.post('/api/auth/reset-password', {
        token,
        newPassword: password,
      });
      setMessage(response.data);
    } catch (err) {
      setError(err.response?.data || 'Failed to reset password');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="text-center mb-3">Reset Password</h3>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button type="submit" className="w-100">
            Reset Password
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default ResetPassword;
