import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

// IDs for accessibility linking
const NEW_PASSWORD_ID = 'newPasswordInput';
const CONFIRM_PASSWORD_ID = 'confirmPasswordInput';
const PASSWORD_HINT_ID = 'passwordHint';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // **Accessibility Improvement for Cognitive/Motor Users:**
    // Set focus back to the first field on error to guide the user immediately.
    if (password !== confirmPassword) {
      setError("The passwords you entered do not match. Please ensure both fields are identical.");
      // Programmatically set focus back to the confirm password field
      document.getElementById(CONFIRM_PASSWORD_ID)?.focus();
      return;
    }

    // Basic password strength check (For illustrative accessibility purposes)
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      document.getElementById(NEW_PASSWORD_ID)?.focus();
      return;
    }

    try {
      const response = await axios.post('/api/auth/reset-password', {
        token,
        newPassword: password,
      });
      setMessage(response.data);
    } catch (err) {
      setError(err.response?.data || 'Failed to reset password. The link may be expired or invalid.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4" style={{ maxWidth: '400px', width: '100%' }}>
        {/* H3 is acceptable here, ensuring a proper H1 exists on the main page/route. */}
        <h3 className="text-center mb-3">Reset Password</h3> 

        {/* **Accessibility Improvement: ARIA Live Regions**
            Role="status" or variant="success" for success messages.
            Role="alert" or variant="danger" for error messages.
            This ensures screen readers announce the success/error without the user having to move focus.
        */}
        {message && <Alert variant="success" role="status" aria-live="polite">{message}</Alert>}
        {error && <Alert variant="danger" role="alert" aria-live="assertive">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            {/* **Accessibility Improvement: htmlFor and id link** */}
            <Form.Label htmlFor={NEW_PASSWORD_ID}>New Password</Form.Label>
            <Form.Control
              id={NEW_PASSWORD_ID}
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              // Provide an accessible description of requirements for cognitive users
              aria-describedby={PASSWORD_HINT_ID}
              // Indicate invalid state for screen readers if an error occurred
              aria-invalid={error.includes("Password must be at least 8 characters") ? "true" : "false"}
            />
            {/* Helper text linked via aria-describedby for cognitive users */}
            <Form.Text id={PASSWORD_HINT_ID} muted>
              Password must be at least 8 characters long.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            {/* **Accessibility Improvement: htmlFor and id link** */}
            <Form.Label htmlFor={CONFIRM_PASSWORD_ID}>Confirm New Password</Form.Label>
            <Form.Control
              id={CONFIRM_PASSWORD_ID}
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              // Indicate invalid state if passwords don't match
              aria-invalid={error.includes("do not match") ? "true" : "false"}
            />
          </Form.Group>

          {/* **Accessibility Improvement: Keyboard/Motor** */}
          {/* Button is large and clearly labeled. Focus is handled by the browser. */}
          <Button type="submit" className="w-100">
            Reset Password
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default ResetPassword;