import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const emailInputRef = useRef(null); // Ref for initial focus and focus management

  // Set the page title on load
  useEffect(() => {
    document.title = 'Forgot Password - Fitness Tracker';
    
    // Accessibility Improvement 1: Set focus to the first interactive element
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // Accessibility Improvement 2: Announce messages
  // This useEffect ensures the error/success message is announced after state changes
  useEffect(() => {
    // If an error occurs, shift focus back to the email field for correction
    if (error && emailInputRef.current) {
        emailInputRef.current.focus();
    }
  }, [error]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      // Assuming a successful response includes a helpful confirmation message
      const response = await axios.post('/api/auth/forgot-password', { email });
      setMessage(response.data.message || 'If an account exists, a password reset link has been sent to your email.');
    } catch (err) {
      // Capture detailed error or use a generic message
      const serverError = err.response?.data?.message || err.response?.data || 'Failed to send reset link due to a network error.';
      setError(serverError);
    }
  };

  return (
    // Accessibility Improvement 3: Use <main> landmark
    <main className="d-flex justify-content-center align-items-center vh-100">
      <Card 
        className="p-4" 
        style={{ maxWidth: '400px', width: '100%' }}
        // Accessibility Improvement 4: Use role="region" to define the component area
        role="region"
        aria-label="Password Reset Request"
      >
        {/* Accessibility Improvement 5: Use <h1> for the main page title (even if styled small) */}
        <h1 className="text-center mb-3 fs-3">Forgot Password</h1>

        {/* Accessibility Improvement 6: Status messages use ARIA live regions */}
        {/* Success messages should be 'polite' (less urgent) */}
        {message && (
            <Alert variant="success" role="status" className="mb-3">
                {message}
            </Alert>
        )}
        {/* Error messages should be 'alert' (urgent and immediate) */}
        {error && (
            <Alert variant="danger" role="alert" className="mb-3">
                {error}
            </Alert>
        )}

        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-4" controlId="formEmail">
            {/* Form.Group + controlId handles implicit linking of Label and Control */}
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              
              // Ref for Accessibility Improvement 1 & 2
              ref={emailInputRef}
              
              // ARIA attributes for validation (if implemented later)
              aria-required="true" 
              autoComplete="email" // Helps cognitive/motor users via browser autofill
            />
            {/* Added Feedback for visual validation cues, if needed */}
            <Form.Control.Feedback type="invalid">Please enter a valid email address.</Form.Control.Feedback>
          </Form.Group>

          <Button 
            type="submit" 
            className="w-100"
            // Accessibility Improvement 7: Ensure visible focus state is maintained by default Bootstrap styles
          >
            Send Reset Link
          </Button>
        </Form>
      </Card>
    </main>
  );
};

export default ForgotPassword;