import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { trackExercise, startSession, stopSession } from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';
import IconButton from '@material-ui/core/IconButton';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';
import BikeIcon from '@material-ui/icons/DirectionsBike';
import PoolIcon from '@material-ui/icons/Pool';
import FitnessCenterIcon from '@material-ui/icons/FitnessCenter';
import OtherIcon from '@material-ui/icons/HelpOutline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TrackExercise = ({ currentUser }) => {
  const [state, setState] = useState({
    exerciseType: '',
    description: '',
    duration: 0,
    date: new Date(),
  });
  const [message, setMessage] = useState('');

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();

    const dataToSubmit = {
      username: currentUser,
      ...state,
    };

    try {
      const response = await trackExercise(dataToSubmit);
      console.log(response.data);

      setState({
        exerciseType: '',
        description: '',
        duration: 0,
        date: new Date(),
      });

      setMessage('Activity logged successfully! Well done!');
      setTimeout(() => setMessage(''), 2000);

    } catch (error) {
      console.error('There was an error logging your activity!', error);
    }
  };

  // Start the in-form timer
  const startTimer = () => {
    if (isRunning) {
      setMessage('Timer is already running');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    setIsRunning(true);
    // attempt to create server-side session
    (async () => {
      try {
        const payload = { username: currentUser, exerciseType: state.exerciseType, description: state.description };
        const resp = await startSession(payload);
        if (resp && resp.data && resp.data.session) {
          setSessionId(resp.data.session._id);
        }
      } catch (err) {
        console.error('Failed to start session', err);
        const msg = err?.response?.data?.error || 'Failed to start timer';
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
        // If server refused start, revert local running state
        setIsRunning(false);
        return;
      }
    })();
    // start counting from current elapsedSeconds
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  // Stop timer and set duration (minutes)
  const stopTimer = () => {
    if (!isRunning && !sessionId) {
      setMessage('No active timer to stop');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    setIsRunning(false);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    // call server to stop session (prefer sessionId if we have it)
    (async () => {
      try {
        const payload = sessionId ? { sessionId } : { username: currentUser };
        const resp = await stopSession(payload);
        if (resp && resp.data && resp.data.session) {
          const secs = resp.data.session.durationSeconds || elapsedSeconds;
          setElapsedSeconds(secs);
          const minutes = Math.round(secs / 60);
          setState({ ...state, duration: minutes });
          setMessage(`Timer stopped: ${formatTime(secs)} (${minutes} min)`);
          setTimeout(() => setMessage(''), 3000);
          setSessionId(null);
        }
      } catch (err) {
        console.error('Failed to stop session', err);
        const msg = err?.response?.data?.error || 'Failed to stop timer';
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
      }
    })();
  };

  const resetTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsRunning(false);
    setElapsedSeconds(0);
    setState({ ...state, duration: 0 });
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div>
      <h3>Track exercise</h3>
      <Form onSubmit={onSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>

        <Form.Group controlId="formDate" className="form-margin">
          <Form.Label>Date:</Form.Label>
          <DatePicker
            selected={state.date}
            onChange={(date) => setState({ ...state, date })}
            dateFormat="yyyy/MM/dd"
          />
        </Form.Group>
        <div style={{ marginBottom: '20px' }}>
          <IconButton color={state.exerciseType === 'Running' ? "primary" : "default"} onClick={() => setState({ ...state, exerciseType: 'Running' })}>
            <DirectionsRunIcon fontSize="large" />
          </IconButton>
          <IconButton color={state.exerciseType === 'Cycling' ? "primary" : "default"} onClick={() => setState({ ...state, exerciseType: 'Cycling' })}>
            <BikeIcon fontSize="large" />
          </IconButton>
          <IconButton color={state.exerciseType === 'Swimming' ? "primary" : "default"} onClick={() => setState({ ...state, exerciseType: 'Swimming' })}>
            <PoolIcon fontSize="large" />
          </IconButton>
          <IconButton color={state.exerciseType === 'Gym' ? "primary" : "default"} onClick={() => setState({ ...state, exerciseType: 'Gym' })}>
            <FitnessCenterIcon fontSize="large" />
          </IconButton>
          <IconButton color={state.exerciseType === 'Other' ? "primary" : "default"} onClick={() => setState({ ...state, exerciseType: 'Other' })}>
            <OtherIcon fontSize="large" />
          </IconButton>
        </div>
        <Form.Group controlId="description" style={{ marginBottom: '20px' }}>
          <Form.Label>Description:</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            required
            value={state.description}
            onChange={(e) => setState({ ...state, description: e.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="duration" style={{ marginBottom: '40px' }}>
          <Form.Label>Duration (in minutes):</Form.Label>
          <Form.Control
            type="number"
            required
            value={state.duration}
            onChange={(e) => setState({ ...state, duration: e.target.value })}
          />
        </Form.Group>
        <div style={{ marginBottom: '20px' }}>
          <strong>Timer:</strong>
          <div style={{ marginTop: '8px', marginBottom: '8px' }}>{formatTime(elapsedSeconds)}</div>
          <Button variant={isRunning ? 'secondary' : 'primary'} onClick={isRunning ? stopTimer : startTimer} style={{ marginRight: '8px' }}>
            {isRunning ? 'Stop Timer' : 'Start Timer'}
          </Button>
          <Button variant="outline-danger" onClick={resetTimer}>Reset</Button>
        </div>
        <Button variant="success" type="submit">
          Save activity
        </Button>
      </Form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
    </div>
  );
};

export default TrackExercise;
