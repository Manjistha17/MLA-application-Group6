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
    // pace: '', // ✅ Added here
    subActivity: '',
    date: new Date(),
  });
  const [message, setMessage] = useState('');

  const [activities, setActivities] = useState([]);  // fetched activities from backend
  const [selectedActivity, setSelectedActivity] = useState(null); // current selected exercise's details


  // Fetch activities from backend on mount
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
  console.log('Activities:', activities);          // what you fetched
  const activity = activities.find((a) => a.activity === type);
  console.log('Selected Activity:', activity);    // should not be null
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

      // Reset form
      setState({
        exerciseType: '',
        description: '',
        duration: 0,
        // pace: '',
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
    <div>
      <h3>Track exercise</h3>
      <Form onSubmit={onSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
        {/* Date Picker */}
        <Form.Group controlId="formDate" className="form-margin">
          <Form.Label>Date:</Form.Label>
          <DatePicker
            selected={state.date}
            onChange={(date) => setState({ ...state, date })}
            dateFormat="yyyy/MM/dd"
          />
        </Form.Group>

        {/* Exercise Type Icons */}
        <div style={{ marginBottom: '20px' }}>
          <IconButton
            color={state.exerciseType === 'Running' ? 'primary' : 'default'}
            // onClick={() => setState({ ...state, exerciseType: 'Running' })}
            onClick={() => handleExerciseTypeSelect('Running')}
          >
            <DirectionsRunIcon fontSize="large" />
          </IconButton>
          <IconButton
            color={state.exerciseType === 'Cycling' ? 'primary' : 'default'}
            // onClick={() => setState({ ...state, exerciseType: 'Cycling' })}
            onClick={() => handleExerciseTypeSelect('Cycling')}
          >
            <BikeIcon fontSize="large" />
          </IconButton>
          <IconButton
            color={state.exerciseType === 'Swimming' ? 'primary' : 'default'}
            // onClick={() => setState({ ...state, exerciseType: 'Swimming' })}
            onClick={() => handleExerciseTypeSelect('Swimming')}
          >
            <PoolIcon fontSize="large" />
          </IconButton>
          <IconButton
            color={state.exerciseType === 'Gym' ? 'primary' : 'default'}
            // onClick={() => setState({ ...state, exerciseType: 'Gym' })}
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

        {/* ✅ Pace Dropdown (moved outside the duration group)
        <Form.Group controlId="pace" style={{ marginBottom: '20px' }}>
          <Form.Label>Select Pace:</Form.Label>
          <Form.Control
            as="select"
            required
            value={state.pace}
            onChange={(e) => setState({ ...state, pace: e.target.value })}
          >
            <option value="">-- Select Pace --</option>
            <option value="Slow">Slow</option>
            <option value="Moderate">Moderate</option>
            <option value="Fast">Fast</option>
          </Form.Control>
        </Form.Group> */}

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




        {/* Submit Button */}
        <Button variant="success" type="submit">
          Save activity
        </Button>
      </Form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
    </div>
  );
};

export default TrackExercise;
