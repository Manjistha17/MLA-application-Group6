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
import '../styles/components/TrackExercise.css';

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
  const [trackingMode, setTrackingMode] = useState('timer');
  const [manualDuration, setManualDuration] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get('http://16.171.162.5:5300/exercises/activities/');
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
    if (sessionData?.duration) {
      setState((prev) => ({
        ...prev,
        duration: Math.round(sessionData.duration / 60),
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

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
        ? `${state.exerciseType} session for ${Math.floor(
            timerSession.duration / 60
          )}m ${timerSession.duration % 60}s`
        : `${state.exerciseType} exercise session`;
    } else {
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
      description,
    };

    try {
      await trackExercise(dataToSubmit);

      setState({
        exerciseType: '',
        duration: 0,
        subActivity: '',
        date: new Date(),
      });
      setManualDuration('');
      setTimerSession(null);

      setMessage(
        `Activity logged successfully! (${
          trackingMode === 'timer' ? 'Timer' : 'Manual'
        } mode)`
      );
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error logging your activity!', error);
      setMessage('Failed to log activity');
    }
  };

  return (
    <div className="trackExercisePage">
      <div className="trackExerciseCard">
        {/* Header */}
        <div className="trackExerciseHeader">
          <h2>Track Exercise</h2>
          <p className="trackExerciseSubtitle">
            Log your workout using a timer or manual entry
          </p>
        </div>

        {/* Mode + Date */}
        <div className="trackTopRow">
          <div className="trackingModeToggle">
            <Button
              variant={trackingMode === 'timer' ? 'primary' : 'outline-primary'}
              onClick={() => setTrackingMode('timer')}
            >
              Timer
            </Button>
            <Button
              variant={trackingMode === 'manual' ? 'secondary' : 'outline-secondary'}
              onClick={() => setTrackingMode('manual')}
            >
              Manual
            </Button>
          </div>

          <div className="dateBlock">
            <Form.Label>Date</Form.Label>
            <DatePicker
              selected={state.date}
              onChange={(date) => setState({ ...state, date })}
              dateFormat="yyyy/MM/dd"
              className="datePicker"
            />
          </div>
        </div>

        <Form onSubmit={onSubmit}>
          {/* Exercise Type */}
          <div className="formSection">
            <Form.Label>Exercise Type</Form.Label>
            <div className="exerciseIconGrid">
              <IconButton
                onClick={() => handleExerciseTypeSelect('Running')}
                color={state.exerciseType === 'Running' ? 'primary' : 'default'}
              >
                <DirectionsRunIcon />
              </IconButton>
              <IconButton
                onClick={() => handleExerciseTypeSelect('Cycling')}
                color={state.exerciseType === 'Cycling' ? 'primary' : 'default'}
              >
                <BikeIcon />
              </IconButton>
              <IconButton
                onClick={() => handleExerciseTypeSelect('Swimming')}
                color={state.exerciseType === 'Swimming' ? 'primary' : 'default'}
              >
                <PoolIcon />
              </IconButton>
              <IconButton
                onClick={() => handleExerciseTypeSelect('Gym')}
                color={state.exerciseType === 'Gym' ? 'primary' : 'default'}
              >
                <FitnessCenterIcon />
              </IconButton>
              <IconButton
                onClick={() => handleExerciseTypeSelect('Yoga')}
                color={state.exerciseType === 'Yoga' ? 'primary' : 'default'}
              >
                <SelfImprovementIcon />
              </IconButton>
              <IconButton
                onClick={() =>
                  setState({ ...state, exerciseType: 'Other' })
                }
                color={state.exerciseType === 'Other' ? 'primary' : 'default'}
              >
                <OtherIcon />
              </IconButton>
            </div>
          </div>

          {/* Sub Activity */}
          {selectedActivity && (
            <Form.Group className="formSection">
              <Form.Label>{selectedActivity.dropdown_label}</Form.Label>
              <Form.Control
                as="select"
                value={state.subActivity}
                onChange={(e) =>
                  setState({ ...state, subActivity: e.target.value })
                }
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

          {/* Timer / Manual (HERO SECTION) */}
          <div className="timerSection">
            {trackingMode === 'timer' && (
              <>
                <h5 className="sectionTitle">Timer</h5>
                <Timer onTimerStop={handleTimerStop} />

                {state.duration > 0 && (
                  <div className="infoBox success">
                    Duration to save: {state.duration} minutes
                  </div>
                )}
              </>
            )}

            {trackingMode === 'manual' && (
              <>
                <h5 className="sectionTitle">Manual Duration</h5>
                <Form.Control
                  type="number"
                  value={manualDuration}
                  onChange={(e) => setManualDuration(e.target.value)}
                  placeholder="Duration in minutes"
                  min="1"
                  max="600"
                  required
                />
              </>
            )}
          </div>

          {/* Save */}
          <div className="saveBlock">
            <Button type="submit" variant="primary" className="w-100">
              {trackingMode === 'timer'
                ? 'Save Activity'
                : 'Save Manual Entry'}
            </Button>
          </div>
        </Form>

        {message && <div className="statusMessage">{message}</div>}
      </div>
    </div>
  );
};

export default TrackExercise;
