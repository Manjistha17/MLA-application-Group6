import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import './journal.css';

const Journal = ({ currentUser }) => {
  // Add state for loading and error messages
  const [startDate, setStartDate] = useState(moment().startOf('week').toDate());
  const [endDate, setEndDate] = useState(moment().endOf('week').toDate());
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set the page title on load
  useEffect(() => {
    document.title = 'Weekly Exercise Journal - Fitness Tracker';
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/stats/weekly/?user=${currentUser}&start=${moment(startDate).format('YYYY-MM-DD')}&end=${moment(endDate).format('YYYY-MM-DD')}`;
      const response = await axios.get(url);

      if (response.data.stats && Array.isArray(response.data.stats)) {
        setExercises(response.data.stats);
      } else {
        setExercises([]);
      }
    } catch (fetchError) {
      console.error('Failed to fetch exercises', fetchError);
      setError('Failed to load weekly journal data.');
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, startDate, endDate]);

  const goToPreviousWeek = () => {
    // Accessibility Improvement 1: Announce date change (via status region)
    setStartDate(moment(startDate).subtract(1, 'weeks').startOf('week').toDate());
    setEndDate(moment(endDate).subtract(1, 'weeks').endOf('week').toDate());
  };

  const goToNextWeek = () => {
    // Accessibility Improvement 1: Announce date change (via status region)
    setStartDate(moment(startDate).add(1, 'weeks').startOf('week').toDate());
    setEndDate(moment(endDate).add(1, 'weeks').endOf('week').toDate());
  };

  const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
  const formattedEndDate = moment(endDate).format('YYYY-MM-DD');
  const dateRangeDescription = `${formattedStartDate} to ${formattedEndDate}`;

  return (
    // Accessibility Improvement 2: Use <main> as the primary landmark
    <main
      role="region"
      aria-label="Weekly Exercise Journal"
      style={{
        backgroundImage: 'url("/login_box.jpg")',
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
      <section // Use <section> for the journal content area
        className="journal-container"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)', // Improved contrast
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '600px',
          width: '90%',
          boxShadow: '0 0 15px rgba(0,0,0,0.3)',
          textAlign: 'left', // Aligned left for readability
        }}
      >
        {/* Accessibility Improvement 3: Use <h1> for main heading */}
        <h1 className="mb-4">Weekly Exercise Journal</h1>
        
        {/* Accessibility Improvement 4: ARIA live region for date status */}
        <div 
          className="date-range d-flex justify-content-between align-items-center"
          role="status" // Signals status update to screen readers
          aria-live="polite" // Announces change politely
          aria-atomic="true" // Announces the entire range
        >
          {/* Accessibility Improvement 5: Descriptive text for buttons */}
          <Button 
            className="button-small" 
            onClick={goToPreviousWeek}
            aria-label="Go to previous week" // Explicit label for screen readers
          >
            &larr; Previous
          </Button>
          <span id="current-date-range">
            {dateRangeDescription}
          </span>
          <Button 
            className="button-small" 
            onClick={goToNextWeek}
            aria-label="Go to next week" // Explicit label for screen readers
          >
            Next &rarr;
          </Button>
        </div>

        {/* Loading and Error States */}
        {loading && <p aria-live="polite" className="text-center mt-3">Loading weekly stats...</p>}
        {error && <p role="alert" style={{ color: 'red' }} className="text-center mt-3">{error}</p>}

        {/* Accessibility Improvement 6: List structure for exercises */}
        <ul aria-labelledby="current-date-range" style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
          {!loading && !error && (
            <>
              {exercises && exercises.length > 0 ? (
                exercises.map((exercise, index) => (
                  // Accessibility Improvement 7: Semantic data presentation
                  <li 
                    key={index} 
                    className="exercise-journal-data p-2 border-bottom"
                    role="listitem"
                  >
                    <h2 className="sr-only">{exercise.exerciseType}</h2> {/* Hidden heading for list item context */}
                    <p className="mb-0">
                      <strong>{exercise.exerciseType}</strong>: {exercise.totalDuration} minutes
                    </p>
                  </li>
                ))
              ) : (
                <li role="listitem">No exercises found for this period.</li>
              )}
            </>
          )}
        </ul>
      </section>
    </main>
  );
};

export default Journal;