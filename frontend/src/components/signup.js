import React, { useEffect, useState, useRef } from 'react';
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

// ... (passwordStrength function remains the same)
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

// ... (loadSaved function remains the same)
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

  // 1. REF for Focus Management
  const formFieldsRef = useRef({});

  // 2. PAGE TITLE
  useEffect(() => {
    document.title = 'Sign Up - Fitness Tracker App';
  }, []);

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

  // ... (validators object remains the same)
  const validators = {
    username: (v) =>
      !v || v.trim().length < 3 ? 'Username must be at least 3 characters.' : '',
    password: (v) =>
      !v || v.length < 8 ? 'Password must be at least 8 characters.' : '', // Updated to 8 for strength indicator match
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

  // 3. FOCUS MANAGEMENT ON SUBMISSION ERROR
  useEffect(() => {
    if (globalError && Object.keys(fieldErrors).length > 0) {
      // Find the name of the first field with an error
      const firstErrorName = Object.keys(fieldErrors)[0];
      
      // Focus on the corresponding input element using the ref
      const firstErrorElement = formFieldsRef.current[firstErrorName];
      if (firstErrorElement) {
        firstErrorElement.focus();
      }
    }
  }, [globalError, fieldErrors]);


  const handleSignup = async (e) => {
    e.preventDefault();
    setGlobalError('');
    const errors = runAllValidators();

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      // Set the global error, which triggers the useEffect to focus on the first field
      setGlobalError('Please fix the highlighted fields to continue.');
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

      const response = await axios.post(
        '/api/auth/signup',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const message =
        typeof response.data === 'string' ? response.data : response.data?.message;

      if (message && message.toLowerCase().includes('success')) {
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
    // Add main role for semantic structure
    <main className="container p-4" aria-live="polite">
      <h1 className="mb-4">Create an Account</h1>
      
      {/* Global Error - role="alert" makes this critical message immediately announced */}
      {globalError && (
        <Alert variant="danger" id={globalErrorId} role="alert" className="mb-3">
          {globalError}
        </Alert>
      )}

      <Form onSubmit={handleSignup} noValidate>
        {/* Username Field */}
        <Form.Group controlId="formUsername" className="mb-3">
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
            // Ref for focus management
            ref={(el) => (formFieldsRef.current.username = el)}
            // ARIA Attributes
            aria-invalid={!!fieldErrors.username}
            aria-describedby={fieldErrors.username ? usernameErrorId : undefined}
          />
          <Form.Control.Feedback type="invalid" id={usernameErrorId}>
            {fieldErrors.username}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Password Field */}
        <Form.Group controlId="formPassword" className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handleBlurValidate}
            isInvalid={!!fieldErrors.password || !!fieldErrors.confirmPassword}
            required
            minLength={8} // Changed to 8
            // Ref for focus management
            ref={(el) => (formFieldsRef.current.password = el)}
            // ARIA Attributes
            aria-describedby={`${passwordHelpId} ${passwordStrengthId} ${
              fieldErrors.password ? passwordErrorId : ''
            }`}
            aria-invalid={!!fieldErrors.password}
          />
          <Form.Text id={passwordHelpId} muted>
            Password must be at least 8 characters long.
          </Form.Text>

          {/* Password Strength Indicator - Use aria-live="polite" to announce changes */}
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
              // Screen readers will announce the label and the role/live change
              aria-label={`Password strength: ${pwdStrength.label}`}
            />
          </div>

          <Form.Control.Feedback type="invalid" id={passwordErrorId}>
            {fieldErrors.password}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Confirm Password Field */}
        <Form.Group controlId="formConfirmPassword" className="mb-3">
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
            // Ref for focus management
            ref={(el) => (formFieldsRef.current.confirmPassword = el)}
            // ARIA Attributes
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
        <Form.Group controlId="formEmail" className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlurValidate}
            isInvalid={!!fieldErrors.email}
            required
            // Ref for focus management
            ref={(el) => (formFieldsRef.current.email = el)}
            // ARIA Attributes
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? emailErrorId : undefined}
          />
          <Form.Control.Feedback type="invalid" id={emailErrorId}>
            {fieldErrors.email}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Contact Field */}
        <Form.Group controlId="formContact" className="mb-3">
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
              // Ref for focus management
              ref={(el) => (formFieldsRef.current.contact = el)}
              // ARIA Attributes
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
        <Form.Group controlId="formAge" className="mb-3">
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
            // Ref for focus management
            ref={(el) => (formFieldsRef.current.age = el)}
            // ARIA Attributes
            aria-invalid={!!fieldErrors.age}
            aria-describedby={fieldErrors.age ? ageErrorId : undefined}
          />
          <Form.Control.Feedback type="invalid" id={ageErrorId}>
            {fieldErrors.age}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Gender Field - Form.Select (dropdown) */}
        <Form.Group controlId="formGender" className="mb-3">
          <Form.Label>Gender</Form.Label>
          <Form.Select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            onBlur={handleBlurValidate}
            isInvalid={!!fieldErrors.gender}
            required
            // Ref for focus management
            ref={(el) => (formFieldsRef.current.gender = el)}
            // ARIA Attributes
            aria-invalid={!!fieldErrors.gender}
            aria-describedby={fieldErrors.gender ? genderErrorId : undefined}
          >
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
        <Form.Group controlId="formHeight" className="mb-3">
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
            // Ref for focus management
            ref={(el) => (formFieldsRef.current.height = el)}
            // ARIA Attributes
            aria-invalid={!!fieldErrors.height}
            aria-describedby={fieldErrors.height ? heightErrorId : undefined}
          />
          <Form.Control.Feedback type="invalid" id={heightErrorId}>
            {fieldErrors.height}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Weight Field */}
        <Form.Group controlId="formWeight" className="mb-3">
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
            // Ref for focus management
            ref={(el) => (formFieldsRef.current.weight = el)}
            // ARIA Attributes
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
          className="mt-3 w-100" // Added w-100 for better mobile/keyboard visibility
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
                aria-hidden="true"
              />
              {' '}Signing up...
            </>
          ) : (
            'Signup'
          )}
        </Button>
      </Form>

      <p className="mt-3 text-center">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </main>
  );
};

Signup.propTypes = {
  onSignup: PropTypes.func.isRequired,
};

export default Signup;