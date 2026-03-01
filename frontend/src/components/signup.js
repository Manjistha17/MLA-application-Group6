import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Form,
  Alert,
  Spinner,
  ProgressBar,
  InputGroup,
  Row,
  Col,
  Container,
} from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const initialForm = {
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  contact: '',
  age: '',
  gender: '',
  height: '',
  weight: '',
};

const passwordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: 'Too short' };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score] || 'Very weak' };
};

const loadSaved = () => {
  try {
    const raw = localStorage.getItem('signupForm');
    return raw ? JSON.parse(raw) : initialForm;
  } catch {
    return initialForm;
  }
};

const Signup = ({ onSignup }) => {
  const [formData, setFormData] = useState(loadSaved);
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('signupForm', JSON.stringify(formData));
    } catch {}
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setGlobalError('');
  };

  const validators = {
    username: (v) =>
      !v || v.trim().length < 3 ? 'Username must be at least 3 characters.' : '',
    password: (v) =>
      !v || v.length < 6 ? 'Password must be at least 6 characters.' : '',
    confirmPassword: (v, all) =>
      v !== all.password ? 'Passwords do not match.' : '',
    email: (v) =>
      !v || !/^\S+@\S+\.\S+$/.test(v) ? 'Enter a valid email address.' : '',
    contact: (v) =>
      !v || !/^\d{7,15}$/.test(v) ? 'Contact must be 7-15 digits.' : '',
    age: (v) => {
      const n = Number(v);
      return !v || !Number.isInteger(n) || n <= 0 || n > 120
        ? 'Enter a valid age (1-120).'
        : '';
    },
    gender: (v) =>
      !['male', 'female', 'other', 'prefer_not_say'].includes(v)
        ? 'Select a gender option.'
        : '',
    height: (v) => {
      const n = Number(v);
      return !v || isNaN(n) || n <= 0 || n > 300 ? 'Enter height in cm. (1–300 cm)' : '';
    },
    weight: (v) => {
      const n = Number(v);
      return !v || isNaN(n) || n <= 0 || n > 500 ? 'Enter weight in kg. (1–500 kg)' : '';
    },
  };

  const runAllValidators = () => {
    const errors = {};
    Object.keys(validators).forEach((key) => {
      const msg = validators[key](formData[key], formData);
      if (msg) errors[key] = msg;
    });
    return errors;
  };

  const handleBlurValidate = (e) => {
    const { name } = e.target;
    const validator = validators[name];
    if (!validator) return;
    const msg = validator(formData[name], formData);
    setFieldErrors((p) => ({ ...p, [name]: msg }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setGlobalError('');
    const errors = runAllValidators();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setGlobalError('Please fix the highlighted fields.');
      const firstErrorKey = Object.keys(errors)[0];
      const firstErrorElement = document.querySelector(`[name="${firstErrorKey}"]`);
      if (firstErrorElement) firstErrorElement.focus();
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        contact: formData.contact,
        age: Number(formData.age),
        gender: formData.gender,
        height: Number(formData.height),
        weight: Number(formData.weight),
      };

      const response = await axios.post('http://16.171.162.5:8080/api/auth/signup', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const message =
        typeof response.data === 'string' ? response.data : response.data?.message;

      if (response.status === 200 || (message && message.toLowerCase().includes('success'))) {
        try {
          localStorage.removeItem('signupForm');
        } catch {}
        onSignup(formData.username);
      } else {
        setGlobalError(message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      const serverMessage =
        err?.response?.data?.message || err?.response?.data || err.message;
      setGlobalError(
        typeof serverMessage === 'string' ? serverMessage : 'Network error. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = passwordStrength(formData.password);
  const progressVariant = ['danger', 'danger', 'warning', 'info', 'success'][
    Math.min(4, pwdStrength.score)
  ];

  const getErrorId = (name) => `error-${name}`;

  return (
    <Container style={{ maxWidth: '700px' }}>
      <Form onSubmit={handleSignup} noValidate>
        {globalError && (
          <Alert variant="danger" className="mb-3" role="alert" aria-live="polite">
            {globalError}
          </Alert>
        )}

        {/* USERNAME */}
        <Form.Group as={Row} className="mb-3" controlId="formUsername">
          <Form.Label column sm={3}>Username</Form.Label>
          <Col sm={9}>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onBlur={handleBlurValidate}
              isInvalid={!!fieldErrors.username}
              required
              minLength={3}
              autoFocus
              aria-describedby={fieldErrors.username ? getErrorId('username') : undefined}
              aria-invalid={!!fieldErrors.username}
            />
            <Form.Control.Feedback type="invalid" id={getErrorId('username')}>
              {fieldErrors.username}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* PASSWORD */}
        <Form.Group as={Row} className="mb-3" controlId="formPassword">
          <Form.Label column sm={3}>Password</Form.Label>
          <Col sm={9}>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlurValidate}
              isInvalid={!!fieldErrors.password || !!fieldErrors.confirmPassword}
              required
              minLength={6}
              aria-describedby={[
                'passwordHelp',
                fieldErrors.password ? getErrorId('password') : null,
              ].filter(Boolean).join(' ')}
              aria-invalid={!!fieldErrors.password || !!fieldErrors.confirmPassword}
            />
            <div className="text-start">
              <Form.Text id="passwordHelp" muted>
                Use at least 8 characters for a stronger password.
              </Form.Text>
            </div>
            <ProgressBar
              now={(pwdStrength.score / 4) * 100}
              label={pwdStrength.label}
              variant={progressVariant}
              animated
              striped
              className="mt-2"
            />
            <Form.Control.Feedback type="invalid" id={getErrorId('password')}>
              {fieldErrors.password}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* CONFIRM PASSWORD */}
        <Form.Group as={Row} className="mb-3" controlId="formConfirmPassword">
          <Form.Label column sm={3}>Confirm</Form.Label>
          <Col sm={9}>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onBlur={handleBlurValidate}
              isInvalid={!!fieldErrors.confirmPassword}
              required
              minLength={6}
              placeholder="Re-enter password"
              aria-describedby={
                fieldErrors.confirmPassword ? getErrorId('confirmPassword') : undefined
              }
              aria-invalid={!!fieldErrors.confirmPassword}
            />
            <Form.Control.Feedback type="invalid" id={getErrorId('confirmPassword')}>
              {fieldErrors.confirmPassword}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* EMAIL */}
        <Form.Group as={Row} className="mb-3" controlId="formEmail">
          <Form.Label column sm={3}>Email</Form.Label>
          <Col sm={9}>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlurValidate}
              isInvalid={!!fieldErrors.email}
              required
              aria-describedby={fieldErrors.email ? getErrorId('email') : undefined}
              aria-invalid={!!fieldErrors.email}
            />
            <Form.Control.Feedback type="invalid" id={getErrorId('email')}>
              {fieldErrors.email}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* CONTACT */}
        <Form.Group as={Row} className="mb-3" controlId="formContact">
          <Form.Label column sm={3}>Phone</Form.Label>
          <Col sm={9}>
            <InputGroup>
              <Form.Control
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                onBlur={handleBlurValidate}
                isInvalid={!!fieldErrors.contact}
                placeholder="Digits only, e.g. 919876543210"
                required
                aria-describedby={[
                  'contactHelp',
                  fieldErrors.contact ? getErrorId('contact') : null,
                ].filter(Boolean).join(' ')}
                aria-invalid={!!fieldErrors.contact}
              />
            </InputGroup>
            <div className="text-start">
              <Form.Text id="contactHelp" muted>
                Include country code if needed, digits only.
              </Form.Text>
            </div>
            <Form.Control.Feedback type="invalid" id={getErrorId('contact')}>
              {fieldErrors.contact}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* AGE */}
        <Form.Group as={Row} className="mb-3" controlId="formAge">
          <Form.Label column sm={3}>Age</Form.Label>
          <Col sm={9}>
            <Form.Control
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              onBlur={handleBlurValidate}
              isInvalid={!!fieldErrors.age}
              min={1}
              max={120}
              required
              aria-describedby={fieldErrors.age ? getErrorId('age') : undefined}
              aria-invalid={!!fieldErrors.age}
            />
            <Form.Control.Feedback type="invalid" id={getErrorId('age')}>
              {fieldErrors.age}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* GENDER */}
        <Form.Group as={Row} className="mb-3" controlId="formGender">
          <Form.Label column sm={3}>Gender</Form.Label>
          <Col sm={9}>
            <Form.Select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              onBlur={handleBlurValidate}
              isInvalid={!!fieldErrors.gender}
              required
              aria-describedby={fieldErrors.gender ? getErrorId('gender') : undefined}
              aria-invalid={!!fieldErrors.gender}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_say">Prefer not to say</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid" id={getErrorId('gender')}>
              {fieldErrors.gender}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* HEIGHT */}
        <Form.Group as={Row} className="mb-3" controlId="formHeight">
          <Form.Label column sm={3}>Height (cm)</Form.Label>
          <Col sm={9}>
            <Form.Control
              type="number"
              name="height"
              value={formData.height}
              onChange={handleInputChange}
              onBlur={handleBlurValidate}
              isInvalid={!!fieldErrors.height}
              min={1}
              max={300}
              required
              aria-describedby={fieldErrors.height ? getErrorId('height') : undefined}
              aria-invalid={!!fieldErrors.height}
            />
            <Form.Control.Feedback type="invalid" id={getErrorId('height')}>
              {fieldErrors.height}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* WEIGHT */}
        <Form.Group as={Row} className="mb-3" controlId="formWeight">
          <Form.Label column sm={3}>Weight (kg)</Form.Label>
          <Col sm={9}>
            <Form.Control
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              onBlur={handleBlurValidate}
              isInvalid={!!fieldErrors.weight}
              min={1}
              max={500}
              required
              aria-describedby={fieldErrors.weight ? getErrorId('weight') : undefined}
              aria-invalid={!!fieldErrors.weight}
            />
            <Form.Control.Feedback type="invalid" id={getErrorId('weight')}>
              {fieldErrors.weight}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>

        <Row>
          <Col sm={{ span: 9, offset: 3 }}>
            <Button variant="primary" type="submit" disabled={loading} className="mt-2">
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{' '}
                  Signing up...
                </>
              ) : (
                'Signup'
              )}
            </Button>
          </Col>
        </Row>
      </Form>

      <p className="mt-3">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </Container>
  );
};

Signup.propTypes = {
  onSignup: PropTypes.func.isRequired,
};

export default Signup;