import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  LinearProgress,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/* ------------------ CONSTANTS ------------------ */

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

const getErrorId = (name) => `error-${name}`;

/* ------------------ PASSWORD STRENGTH ------------------ */

const passwordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: 'Too short' };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
  return { score, label: ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][score] };
};

/* ------------------ LOAD SAVED FORM ------------------ */

const loadSaved = () => {
  try {
    const raw = localStorage.getItem('signupForm');
    return raw ? JSON.parse(raw) : initialForm;
  } catch {
    return initialForm;
  }
};

/* ------------------ COMPONENT ------------------ */

const Signup = ({ onSignup }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(loadSaved);
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  /* Persist form (accessibility-safe) */
  useEffect(() => {
    localStorage.setItem('signupForm', JSON.stringify(formData));
  }, [formData]);

  /* ------------------ HANDLERS ------------------ */

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setFieldErrors((p) => ({ ...p, [name]: '' }));
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
      !/^\S+@\S+\.\S+$/.test(v) ? 'Enter a valid email address.' : '',
    contact: (v) =>
      !/^\d{7,15}$/.test(v) ? 'Contact must be 7–15 digits.' : '',
    age: (v) =>
      v < 1 || v > 120 ? 'Enter a valid age (1–120).' : '',
    gender: (v) =>
      !['male', 'female', 'other', 'prefer_not_say'].includes(v)
        ? 'Select a gender.'
        : '',
    height: (v) =>
      v < 1 || v > 300 ? 'Height must be 1–300 cm.' : '',
    weight: (v) =>
      v < 1 || v > 500 ? 'Weight must be 1–500 kg.' : '',
  };

  const handleBlurValidate = (e) => {
    const { name } = e.target;
    if (!validators[name]) return;
    setFieldErrors((p) => ({
      ...p,
      [name]: validators[name](formData[name], formData),
    }));
  };

  const runAllValidators = () => {
    const errors = {};
    Object.keys(validators).forEach((k) => {
      const msg = validators[k](formData[k], formData);
      if (msg) errors[k] = msg;
    });
    return errors;
  };

  /* ------------------ SUBMIT ------------------ */

  const handleSignup = async (e) => {
    e.preventDefault();

    const errors = runAllValidators();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setGlobalError('Please fix the highlighted fields.');
      document.querySelector(`[name="${Object.keys(errors)[0]}"]`)?.focus();
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
        height: Number(formData.height),
        weight: Number(formData.weight),
      };

      const response = await axios.post('https://d393qv373r18to.cloudfront.net/api/auth/signup', payload, {
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
      setGlobalError(
        err?.response?.data?.message || 'Signup failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const pwd = passwordStrength(formData.password);



  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 6 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={600}>
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track workouts, monitor progress, and stay consistent.
          </Typography>

          <Box
            sx={{
              my: 2,
              borderBottom: '1px solid var(--color-border-subtle)',
            }}
          />

          {globalError && (
            <Alert severity="error" role="alert" aria-live="polite">
              {globalError}
            </Alert>
          )}

          <form onSubmit={handleSignup} noValidate>
            <TextField fullWidth margin="dense" label="Username" name="username"
              value={formData.username} onChange={handleInputChange}
              onBlur={handleBlurValidate} error={!!fieldErrors.username}
              helperText={fieldErrors.username || ' '}
              aria-describedby={getErrorId('username')}
              aria-invalid={!!fieldErrors.username} required />

            <TextField fullWidth margin="dense" type="password" label="Password"
              name="password" value={formData.password}
              onChange={handleInputChange} onBlur={handleBlurValidate}
              error={!!fieldErrors.password}
              helperText="Use at least 8 characters"
              aria-invalid={!!fieldErrors.password} required />

            <LinearProgress
              variant="determinate"
              value={(pwd.score / 4) * 100}
              sx={{ mt: 1, mb: 2 }}
            />

            <TextField fullWidth margin="dense" type="password"
              label="Confirm Password" name="confirmPassword"
              value={formData.confirmPassword} onChange={handleInputChange}
              onBlur={handleBlurValidate} error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword || ' '}
              aria-invalid={!!fieldErrors.confirmPassword} required />

            <Box
              sx={{
                my: 2,
                borderBottom: '1px solid var(--color-border-subtle)',
              }}
            />

            <TextField fullWidth margin="dense" label="Email" name="email"
              value={formData.email} onChange={handleInputChange}
              onBlur={handleBlurValidate} error={!!fieldErrors.email}
              helperText={fieldErrors.email || ' '} required />

            <TextField fullWidth margin="dense" label="Phone" name="contact"
              value={formData.contact} onChange={handleInputChange}
              onBlur={handleBlurValidate} error={!!fieldErrors.contact}
              helperText={fieldErrors.contact || 'Include country code'} required />

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>

                <TextField
                  fullWidth
                  margin="dense"
                  label="Age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  onBlur={handleBlurValidate}
                  error={!!fieldErrors.age}
                  helperText={fieldErrors.age || ' '}
                  aria-describedby={getErrorId('age')}
                  aria-invalid={!!fieldErrors.age}
                  required
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  margin="dense"
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  onBlur={handleBlurValidate}
                  error={!!fieldErrors.gender}
                  helperText={fieldErrors.gender || ' '}
                  SelectProps={{
                    displayEmpty: true
                  }}
                  InputLabelProps={{
                    shrink: true
                  }}
                >
                  <MenuItem value="">
                    <em>Select</em>
                  </MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer_not_say">Prefer not to say</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  label="Height (cm)"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  onBlur={handleBlurValidate}
                  error={!!fieldErrors.height}
                  helperText={fieldErrors.height || ' '}
                  aria-describedby={getErrorId('height')}
                  aria-invalid={!!fieldErrors.height}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  label="Weight (kg)"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  onBlur={handleBlurValidate}
                  error={!!fieldErrors.weight}
                  helperText={fieldErrors.weight || ' '}
                  aria-describedby={getErrorId('weight')}
                  aria-invalid={!!fieldErrors.weight}
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid item xs={6}>
                <Button fullWidth variant="outlined" onClick={() => navigate('/')}>
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button fullWidth variant="contained" type="submit" disabled={loading}>
                  {loading ? 'Signing up…' : 'Create Account'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Typography align="center" sx={{ mt: 3 }}>
        Already have an account? <Link to="/login">Login</Link>
      </Typography>
    </Container>
  );
};

Signup.propTypes = { onSignup: PropTypes.func.isRequired };
export default Signup;