import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { trackExercise } from '../api';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import IconButton from '@material-ui/core/IconButton';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';
import BikeIcon from '@material-ui/icons/DirectionsBike';
import PoolIcon from '@material-ui/icons/Pool';
import FitnessCenterIcon from '@material-ui/icons/FitnessCenter';
import OtherIcon from '@material-ui/icons/HelpOutline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Timer from './Timer';

const TrackExercise = ({ currentUser }) => {
  const [state, setState] = useState({
    exerciseType: '',
    duration: 0,
    subActivity: '',
    date: new Date(),
    startTime: null,
    endTime: null,
  });
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get('http://localhost:5300/exercises/activities/');
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');

    // Validation
    if (!currentUser) {
      setErrorMsg('Please log in to save an activity.');
      return;
    }
    if (!state.exerciseType) {
      setErrorMsg('Please select an exercise type.');
      return;
    }
    if (selectedActivity && !state.subActivity) {
      setErrorMsg('Please select a sub-activity option.');
      return;
    }
    const durationInt = Number.isFinite(state.duration) ? Math.floor(Number(state.duration)) : 0;
    if (!durationInt || durationInt < 1) {
      setErrorMsg('Please record a duration with the timer before saving.');
      return;
    }

    const dateIso = state.date instanceof Date ? state.date.toISOString() : state.date;
    const dataToSubmit = {
      username: currentUser,
      exerciseType: state.exerciseType,
      subActivity: state.subActivity,
      description: state.description,
      duration: durationInt,
      date: dateIso,
      startTime: state.startTime,
      endTime: state.endTime,
    };

    try {
      const response = await trackExercise(dataToSubmit);
      console.log(response.data);

      setState({
        exerciseType: '',
        duration: 0,
        subActivity: '',
        date: new Date(),
        startTime: null,
        endTime: null,
      });

      setMessage('✅ Activity logged successfully!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error logging your activity!', error);
      const detail = error?.response?.data?.error || error.message || 'Unknown error';
      setErrorMsg(`❌ Failed to log activity: ${detail}`);
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
              color={state.exerciseType === 'Other' ? 'primary' : 'default'}
              onClick={() => setState({ ...state, exerciseType: 'Other' })}
            >
              <OtherIcon fontSize="large" />
            </IconButton>
          </div>

          {/* Timer */}
          <div style={{ marginBottom: '20px' }}>
            <Timer onTimerStop={(session) => {
              // Store exact duration in seconds and session timestamps
              setState(prev => ({
                ...prev,
                duration: Number(session.duration),
                startTime: session.startTime,
                endTime: session.endTime,
              }));
            }} />
          </div>

          {/* Sub-Activity Dropdown */}
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
            Save activity
          </Button>
        </Form>

        {message && (
          <p className="text-center mt-3" style={{ color: 'green' }}>
            {message}
          </p>
        )}
        {errorMsg && (
          <p className="text-center mt-2" style={{ color: 'red' }}>
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
};

export default TrackExercise;
