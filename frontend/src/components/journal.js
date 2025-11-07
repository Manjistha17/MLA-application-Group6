import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import './journal.css';

const Journal = ({ currentUser }) => {
  const [startDate, setStartDate] = useState(moment().startOf('week').toDate());
  const [endDate, setEndDate] = useState(moment().endOf('week').toDate());
  const [exercises, setExercises] = useState([]);

  const fetchExercises = async () => {
    try {
      const url = `http://localhost:5050/stats/weekly/?user=${currentUser}&start=${moment(startDate).format('YYYY-MM-DD')}&end=${moment(endDate).format('YYYY-MM-DD')}`;
      const response = await axios.get(url);
      console.log('API Response:', response.data);
      if (response.data.stats && Array.isArray(response.data.stats)) {
        setExercises(response.data.stats);
      } else {
        console.error('Unexpected response structure:', response.data);
        setExercises([]);
      }
    } catch (error) {
      console.error('Failed to fetch exercises', error);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [currentUser, startDate, endDate]);

  const goToPreviousWeek = () => {
    setStartDate(moment(startDate).subtract(1, 'weeks').startOf('week').toDate());
    setEndDate(moment(endDate).subtract(1, 'weeks').endOf('week').toDate());
  };

  const goToNextWeek = () => {
    setStartDate(moment(startDate).add(1, 'weeks').startOf('week').toDate());
    setEndDate(moment(endDate).add(1, 'weeks').endOf('week').toDate());
  };

  return (
    <div
      style={{
        backgroundImage: 'url("/login_box.jpg")', // ✅ Background from public
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
      }}
    >
      <div
        className="journal-container"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // ✅ Transparent white box
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '600px',
          width: '90%',
          boxShadow: '0 0 15px rgba(0,0,0,0.2)',
          textAlign: 'center',
        }}
      >
        <h4>Weekly Exercise Journal</h4>
        <br />
        <div className="date-range">
          <Button className="button-small" onClick={goToPreviousWeek}>
            &larr; Previous
          </Button>
          <span>
            {moment(startDate).format('YYYY-MM-DD')} to {moment(endDate).format('YYYY-MM-DD')}
          </span>
          <Button className="button-small" onClick={goToNextWeek}>
            Next &rarr;
          </Button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
          {exercises && exercises.length > 0 ? (
            exercises.map((exercise, index) => (
              <li key={index} className="exercise-journal-data">
                {exercise.exerciseType} - {exercise.totalDuration} minutes
              </li>
            ))
          ) : (
            <li>No exercises found for this period.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Journal;
