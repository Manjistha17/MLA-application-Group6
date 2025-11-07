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

const TrackExercise = ({ currentUser }) => {
  const [state, setState] = useState({
    exerciseType: '',
    description: '',
    duration: 0,
    subActivity: '',
    date: new Date(),
  });
  const [message, setMessage] = useState('');
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
        subActivity: '',
        date: new Date(),
      });

      setMessage('✅ Activity logged successfully!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error logging your activity!', error);
      setMessage('❌ Failed to log activity');
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

          {/* Description */}
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

          {/* Duration */}
          <Form.Group controlId="duration" style={{ marginBottom: '20px' }}>
            <Form.Label>Duration (in minutes):</Form.Label>
            <Form.Control
              type="number"
              required
              value={state.duration}
              onChange={(e) => setState({ ...state, duration: e.target.value })}
            />
          </Form.Group>

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
      </div>
    </div>
  );
};

export default TrackExercise;
