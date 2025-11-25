import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { trackExercise } from '../api';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import IconButton from '@mui/material/IconButton';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import BikeIcon from '@mui/icons-material/DirectionsBike';
import PoolIcon from '@mui/icons-material/Pool';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import OtherIcon from '@mui/icons-material/HelpOutline';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Timer from './Timer';

const TrackExercise = ({ currentUser }) => {
  const [state, setState] = useState({
    exerciseType: '',
    duration: 0,
    subActivity: '',
    date: new Date(),
  });
  const [message, setMessage] = useState('');
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [timerSession, setTimerSession] = useState(null);
  const [trackingMode, setTrackingMode] = useState('timer'); // 'timer' or 'manual'
  const [manualDuration, setManualDuration] = useState('');
  
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get('/exercises/activities/');
        setActivities(response.data);
      } catch (error) {
        console.error('Error fetching activities', error);
      }
    };
    fetchActivities();
  }, []);

  const handleExerciseTypeSelect = (type) => {
    const activity = activities.find((a) => a.activity === type);
    setState({ ...state, exerciseType: type, subActivity: '' });
    setSelectedActivity(activity || null);
  };

  const handleTimerStop = (sessionData) => {
    setTimerSession(sessionData);
    // Automatically populate duration with timer data
    if (sessionData && sessionData.duration) {
      setState(prev => ({ 
        ...prev, 
        duration: Math.round(sessionData.duration / 60) // Convert seconds to minutes
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Validate duration based on tracking mode
    let finalDuration = 0;
    let description = '';
    
    if (trackingMode === 'timer') {
      if (!state.duration || state.duration <= 0) {
        setMessage('Please use the timer to track your exercise duration!');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      finalDuration = state.duration;
      description = timerSession 
        ? `${state.exerciseType} session for ${Math.floor(timerSession.duration / 60)}m ${timerSession.duration % 60}s`
        : `${state.exerciseType} exercise session`;
    } else {
      // Manual mode validation
      if (!manualDuration || parseInt(manualDuration) <= 0) {
        setMessage('Please enter a valid duration in minutes!');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      finalDuration = parseInt(manualDuration);
      description = `${state.exerciseType} exercise (${finalDuration} minutes) - manually logged`;
    }
    
    const dataToSubmit = {
      username: currentUser,
      ...state,
      duration: finalDuration,
      description: description,
    };

    try {
      const response = await trackExercise(dataToSubmit);
      console.log(response.data);

      setState({
        exerciseType: '',
        duration: 0,
        subActivity: '',
        date: new Date(),
      });
      setManualDuration('');
      setTimerSession(null);

      setMessage(`Activity logged successfully! (${trackingMode === 'timer' ? 'Timer' : 'Manual'} mode)`);
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error logging your activity!', error);
      setMessage('Failed to log activity');
    }
  };

  return (
    <div
      style={{
        backgroundImage: 'url("/login_box.jpg")', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.95, // ✅ makes the entire background slightly transparent
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
          width: '400px',
        }}
      >
        <h3 className="text-center mb-4">Track Exercise</h3>
        
        {/* Mode Description */}
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px', fontSize: '14px' }}>
          <div className="text-center">
            <strong>Choose your tracking method:</strong>
          </div>
          <div style={{ marginTop: '5px' }}>
            <strong>Timer Mode:</strong> Track live workouts with the built-in timer<br/>
            <strong>Manual Log:</strong> Log past activities by entering duration manually
          </div>
        </div>
        
        {/* Tracking Mode Toggle */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <Button
            variant={trackingMode === 'timer' ? 'primary' : 'outline-primary'}
            onClick={() => setTrackingMode('timer')}
            style={{ marginRight: '10px' }}
          >
            Timer Mode
          </Button>
          <Button
            variant={trackingMode === 'manual' ? 'success' : 'outline-success'}
            onClick={() => setTrackingMode('manual')}
          >
            Manual Log
          </Button>
        </div>

        <Form onSubmit={onSubmit}>
          <Form.Group controlId="formDate" className="form-margin">
            <Form.Label>Date:</Form.Label>
            <DatePicker
              selected={state.date}
              onChange={(date) => setState({ ...state, date })}
              dateFormat="yyyy/MM/dd"
            />
          </Form.Group>

          {/* Exercise Type Icons */}
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <IconButton
              color={state.exerciseType === 'Running' ? 'primary' : 'default'}
              onClick={() => handleExerciseTypeSelect('Running')}
            >
              <DirectionsRunIcon fontSize="large" />
            </IconButton>
            <IconButton
              color={state.exerciseType === 'Cycling' ? 'primary' : 'default'}
              onClick={() => handleExerciseTypeSelect('Cycling')}
            >
              <BikeIcon fontSize="large" />
            </IconButton>
            <IconButton
              color={state.exerciseType === 'Swimming' ? 'primary' : 'default'}
              onClick={() => handleExerciseTypeSelect('Swimming')}
            >
              <PoolIcon fontSize="large" />
            </IconButton>
            <IconButton
              color={state.exerciseType === 'Gym' ? 'primary' : 'default'}
              onClick={() => handleExerciseTypeSelect('Gym')}
            >
              <FitnessCenterIcon fontSize="large" />
            </IconButton>
            <IconButton
              color={state.exerciseType === 'Yoga' ? 'primary' : 'default'}
              onClick={() => handleExerciseTypeSelect('Yoga')}
            >
              <SelfImprovementIcon fontSize="large" />
            </IconButton>
            <IconButton
              color={state.exerciseType === 'Other' ? 'primary' : 'default'}
              onClick={() => setState({ ...state, exerciseType: 'Other' })}
            >
              <OtherIcon fontSize="large" />
            </IconButton>
          </div>

          {/* Timer Component - Only show in timer mode */}
          {trackingMode === 'timer' && (
            <div style={{ marginBottom: '20px' }}>
              <h5 className="text-center">Exercise Timer</h5>
              <Timer onTimerStop={handleTimerStop} />
              {timerSession && (
                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
                  <small>
                    Last session: {Math.floor(timerSession.duration / 60)}m {timerSession.duration % 60}s
                  </small>
                </div>
              )}
              {state.duration > 0 && (
                <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#e8f5e8', borderRadius: '5px', textAlign: 'center' }}>
                  <small style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    Duration to save: {state.duration} minutes
                  </small>
                </div>
              )}
            </div>
          )}

          {/* Manual Duration Input - Only show in manual mode */}
          {trackingMode === 'manual' && (
            <div style={{ marginBottom: '20px' }}>
              <h5 className="text-center">Manual Duration Entry</h5>
              <Form.Group controlId="manualDuration">
                <Form.Label>Duration (minutes):</Form.Label>
                <Form.Control
                  type="number"
                  value={manualDuration}
                  onChange={(e) => setManualDuration(e.target.value)}
                  placeholder="Enter duration in minutes"
                  min="1"
                  max="600"
                  required
                />
                <Form.Text className="text-muted">
                  Enter how many minutes you exercised (1-600 minutes)
                </Form.Text>
              </Form.Group>
              {manualDuration && parseInt(manualDuration) > 0 && (
                <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#fff3cd', borderRadius: '5px', textAlign: 'center' }}>
                  <small style={{ color: '#856404', fontWeight: 'bold' }}>
                    Manual entry: {manualDuration} minutes
                  </small>
                </div>
              )}
            </div>
          )}

          {selectedActivity && (
            <Form.Group controlId="subActivity" style={{ marginBottom: '20px' }}>
              <Form.Label>{selectedActivity.dropdown_label}</Form.Label>
              <Form.Control
                as="select"
                value={state.subActivity}
                onChange={(e) => setState({ ...state, subActivity: e.target.value })}
                required
              >
                <option value="">-- Select --</option>
                {selectedActivity.sub_activity_options.map((opt) => (
                  <option key={opt.name} value={opt.name}>
                    {opt.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          )}

          <Button variant="success" type="submit" className="w-100">
            {trackingMode === 'timer' ? 'Save Timed Activity' : 'Save Manual Entry'}
          </Button>
        </Form>

        {message && (
          <p className="text-center mt-3" style={{ color: 'green' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default TrackExercise;
