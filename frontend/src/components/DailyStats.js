import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DailyStats.css'; // Assuming this provides general layout/visual styles

const DailyStats = ({ currentUser }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track error state

  // Set the page title
  useEffect(() => {
    document.title = 'Today\'s Stats - Fitness Tracker';
  }, []);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `/stats/daily/`;
        const response = await axios.get(url);

        if (response.data.stats && Array.isArray(response.data.stats)) {
          setExercises(response.data.stats);
        } else {
          setExercises([]);
        }
      } catch (fetchError) {
        console.error('Failed to fetch daily exercises', fetchError);
        // Provide user-friendly error message
        setError('Failed to load daily stats. Please try again later.');
        setExercises([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [currentUser]);

  // Accessibility Improvement 1: Use <main> as a landmark
  return (
    <main
      // Added role="region" with aria-label if <main> isn't sufficient in some contexts
      role="region"
      aria-label="Today's Exercise Statistics"
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
      <section // Accessibility Improvement 2: Use <section> for main content area
        className="journal-container"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)', // Increased opacity for better text contrast
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '700px',
          width: '90%',
          boxShadow: '0 0 15px rgba(0,0,0,0.3)',
          textAlign: 'left', // Aligned text left for better readability
        }}
      >
        {/* Accessibility Improvement 3: Clear, descriptive heading */}
        <h1 className="mb-4" tabIndex="-1">Today's Fitness Summary</h1>

        {/* Loading and Error States */}
        {loading && <p aria-live="polite">Loading daily stats...</p>}
        {error && <p role="alert" style={{ color: 'red' }}>{error}</p>}
        
        {/* Actual Content Display */}
        {!loading && !error && (
          <>
            {exercises.length > 0 ? (
              <div className="exercise-cards">
                <h2 className="sr-only">List of Exercises</h2> {/* Hidden H2 for screen reader structure */}
                {exercises.map((exercise, index) => (
                  // Accessibility Improvement 4: Use <div> with role="group"
                  // Alternatively, use <article> if each card is considered self-contained content.
                  <div
                    key={`${exercise.exerciseType}-${exercise.subActivity || 'none'}-${index}`}
                    className="exercise-card"
                    role="group"
                    aria-label={`${exercise.exerciseType} details`}
                    style={{
                      backgroundColor: 'rgba(240, 240, 240, 1)', // Solid background for text contrast
                      borderRadius: '10px',
                      padding: '15px',
                      marginBottom: '15px',
                      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    }}
                  >
                    {/* Accessibility Improvement 5: Descriptive heading for each card */}
                    <h3>{exercise.exerciseType}</h3> 
                    
                    {/* Data presented clearly with strong labels */}
                    <p>
                      <span aria-hidden="true">🏷</span> <strong>Sub Activity:</strong>{' '}
                      <span className="data-value">{exercise.subActivity || '—'}</span>
                    </p>
                    <p>
                      <span aria-hidden="true">⏱</span> <strong>Duration:</strong>{' '}
                      <span className="data-value">{exercise.totalDuration}</span> minutes
                    </p>
                    <p>
                      <span aria-hidden="true">🔥</span> <strong>Energy Burned:</strong>{' '}
                      <span className="data-value">{exercise.totalCalories}</span> kcal
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              // Accessibility Improvement 6: Clear message for no data
              <p>✅ Great start! No exercises found for today yet. Log your first activity to see stats here.</p>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default DailyStats;