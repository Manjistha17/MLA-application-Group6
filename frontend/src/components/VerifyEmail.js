import React, { useEffect, useState } from 'react';
import { Container, Card, Alert, Spinner } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // get token from URL
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const response = await axios.get(`/api/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully.');

        // Optional: auto redirect after 3 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Email verification failed.');
      }
    };

    verify();
  }, [token]);

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="text-center mb-3">Email Verification</h3>

        {status === 'loading' && (
          <div className="text-center">
            <Spinner animation="border" role="status" />
            <p className="mt-2">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && <Alert variant="success">{message}</Alert>}
        {status === 'error' && <Alert variant="danger">{message}</Alert>}
      </Card>
    </Container>
  );
};

export default VerifyEmail;
