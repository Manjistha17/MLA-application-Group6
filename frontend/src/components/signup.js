import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Form,
  Alert,
  Spinner,
  ProgressBar,
  InputGroup,
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
  const [fieldErrors, setFieldErrors] = useState({}); // per-field inline messages
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // persist form while user types (useful for long forms)
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

  // inline validators return message or empty string
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
      return !v || isNaN(n) || n <= 0 || n > 300 ? 'Enter height in cm.' : '';
    },
    weight: (v) => {
      const n = Number(v);
      return !v || isNaN(n) || n <= 0 || n > 500 ? 'Enter weight in kg.' : '';
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
      // Announce the error for screen reader users
      setGlobalError('Please fix the highlighted fields.');
      return;
    }

    setLoading(true);
    try {
      // map client fields to backend shape if needed before sending
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

      const response = await axios.post(
        '/api/auth/signup',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const message =
        typeof response.data === 'string' ? response.data : response.data?.message;

      if (message && message.toLowerCase().includes('success')) {
        // clear saved draft on success
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
        typeof serverMessage === 'string'
          ? serverMessage
          : 'Network error. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = passwordStrength(formData.password);
  const progressVariant = ['danger', 'danger', 'warning', 'info', 'success'][
    Math.min(4, pwdStrength.score)
  ];
  
  // Create unique IDs for ARIA linking
  const usernameErrorId = 'usernameError';
  const passwordErrorId = 'passwordError';
  const passwordHelpId = 'passwordHelp';
  const confirmPasswordErrorId = 'confirmPasswordError';
  const emailErrorId = 'emailError';
  const contactErrorId = 'contactError';
  const contactHelpId = 'contactHelp';
  const ageErrorId = 'ageError';
  const genderErrorId = 'genderError';
  const heightErrorId = 'heightError';
  const weightErrorId = 'weightError';
  const passwordStrengthId = 'passwordStrengthStatus';
  const globalErrorId = 'globalError';

  return (
    // Use role="region" and aria-live for the error message area
    <div aria-live="polite">
      {/* Role of alert for critical, time-sensitive errors */}
      {globalError && (
        <Alert variant="danger" id={globalErrorId} role="alert">
          {globalError}
        </Alert>
      )}

      <Form onSubmit={handleSignup} noValidate>
        {/* Username Field */}
        <Form.Group controlId="formUsername" className="mb-2">
          <Form.Label>Username</Form.Label>
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
            // Link error message for screen readers
            aria-invalid={!!fieldErrors.username}
            aria-describedby={fieldErrors.username ? usernameErrorId : undefined}
          />
          <Form.Control.Feedback type="invalid" id={usernameErrorId}>
            {fieldErrors.username}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Password Field */}
        <Form.Group controlId="formPassword" className="mb-2">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handleBlurValidate}
            isInvalid={!!fieldErrors.password || !!fieldErrors.confirmPassword}
            required
            minLength={6}
            // Link help text and error message
            aria-describedby={`${passwordHelpId} ${passwordStrengthId} ${
              fieldErrors.password ? passwordErrorId : ''
            }`}
            aria-invalid={!!fieldErrors.password}
          />
          <Form.Text id={passwordHelpId} muted>
            Use at least 8 characters for a stronger password.
          </Form.Text>

          {/* Password Strength Indicator - Use aria-live to announce changes */}
          <div className="mt-2">
            <ProgressBar
              now={(pwdStrength.score / 4) * 100}
              label={pwdStrength.label}
              variant={progressVariant}
              animated
              striped
              // Make the progress bar accessible with ARIA
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-valuenow={pwdStrength.score}
              aria-valuemin={0}
              aria-valuemax={4}
              // Hidden span to provide a clear, full description of the status
              aria-label={`Password strength: ${pwdStrength.label}`}
            />
          </div>

          <Form.Control.Feedback type="invalid" id={passwordErrorId}>
            {fieldErrors.password}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Confirm Password Field */}
        <Form.Group controlId="formConfirmPassword" className="mb-2">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            onBlur={handleBlurValidate}
            isInvalid={!!fieldErrors.confirmPassword}
            required
            minLength={6}
            aria-invalid={!!fieldErrors.confirmPassword}
            aria-describedby={
              fieldErrors.confirmPassword ? confirmPasswordErrorId : undefined
            }
          />
          <Form.Control.Feedback type="invalid" id={confirmPasswordErrorId}>
            {fieldErrors.confirmPassword}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Email Field */}
        <Form.Group controlId="formEmail" className="mb-2">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlurValidate}
            isInvalid={!!fieldErrors.email}
            required
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? emailErrorId : undefined}
          />
          <Form.Control.Feedback type="invalid" id={emailErrorId}>
            {fieldErrors.email}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Contact Field */}
        <Form.Group controlId="formContact" className="mb-2">
          <Form.Label>Contact Number</Form.Label>
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
              aria-invalid={!!fieldErrors.contact}
              aria-describedby={`${contactHelpId} ${
                fieldErrors.contact ? contactErrorId : ''
              }`}
            />
          </InputGroup>
          <Form.Control.Feedback type="invalid" id={contactErrorId}>
            {fieldErrors.contact}
          </Form.Control.Feedback>
          <Form.Text id={contactHelpId} muted>
            Include country code if needed, digits only.
          </Form.Text>
        </Form.Group>

        {/* Age Field */}
        <Form.Group controlId="formAge" className="mb-2">
          <Form.Label>Age</Form.Label>
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
            aria-invalid={!!fieldErrors.age}
            aria-describedby={fieldErrors.age ? ageErrorId : undefined}
          />
          <Form.Control.Feedback type="invalid" id={ageErrorId}>
            {fieldErrors.age}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Gender Field - Form.Select (dropdown) */}
        <Form.Group controlId="formGender" className="mb-2">
          <Form.Label>Gender</Form.Label>
          <Form.Select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            onBlur={handleBlurValidate}
            isInvalid={!!fieldErrors.gender}
            required
            aria-invalid={!!fieldErrors.gender}
            aria-describedby={fieldErrors.gender ? genderErrorId : undefined}
          >
            {/* The first option should be disabled/unselectable if possible, or have a meaningful prompt */}
            <option value="" disabled>Select a gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_say">Prefer not to say</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid" id={genderErrorId}>
            {fieldErrors.gender}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Height Field */}
        <Form.Group controlId="formHeight" className="mb-2">
          <Form.Label>Height (cm)</Form.Label>
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
            aria-invalid={!!fieldErrors.height}
            aria-describedby={fieldErrors.height ? heightErrorId : undefined}
          />
          <Form.Control.Feedback type="invalid" id={heightErrorId}>
            {fieldErrors.height}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Weight Field */}
        <Form.Group controlId="formWeight" className="mb-2">
          <Form.Label>Weight (kg)</Form.Label>
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
            aria-invalid={!!fieldErrors.weight}
            aria-describedby={fieldErrors.weight ? weightErrorId : undefined}
          />
          <Form.Control.Feedback type="invalid" id={weightErrorId}>
            {fieldErrors.weight}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Submit Button */}
        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          className="mt-2"
          // Set aria-live="polite" on the button's text when loading to announce status change
          aria-live={loading ? 'polite' : undefined}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true" // Hide the visual spinner from screen readers, the text is the status
              />
              {' '}Signing up...
            </>
          ) : (
            'Signup'
          )}
        </Button>
      </Form>

      <p className="mt-3">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

Signup.propTypes = {
  onSignup: PropTypes.func.isRequired,
};

export default Signup;