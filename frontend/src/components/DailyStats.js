import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DailyStats.css';

const DailyStats = ({ currentUser }) => {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const url = `/stats/daily/?user=${currentUser}`;
        const response = await axios.get(url);

        if (response.data.stats && Array.isArray(response.data.stats)) {
          setExercises(response.data.stats);
        } else {
          setExercises([]);
        }
      } catch (error) {
        console.error('Failed to fetch daily exercises', error);
        setExercises([]);
      }
    };

    fetchExercises();
  }, [currentUser]); // Optional dependency if user context changes

  // return (
  //   <div className="journal-container">
  //     <h4>Today's Exercise Stats</h4>
  //     <ul>
  //       {exercises.length > 0 ? (
  //         exercises.map((exercise) => (
  //           <li key={exercise.exerciseType} className="exercise-journal-data">
  //             {exercise.exerciseType} - {exercise.totalDuration} minutes
  //           </li>
  //         ))
  //       ) : (
  //         <li>No exercises found for today.</li>
  //       )}
  //     </ul>
  //   </div>
  // );
  //   return (
  //   <div className="journal-container">
  //     <h4>Today's Exercise Stats</h4>
  //     <ul>
  //       {exercises.length > 0 ? (
  //         exercises.map((exercise) => (
  //           <li key={exercise.exerciseType} className="exercise-journal-data">
  //             {exercise.exerciseType} - {exercise.totalDuration} minutes - {exercise.totalCalories} calories
  //           </li>
  //         ))
  //       ) : (
  //         <li>No exercises found for today.</li>
  //       )}
  //     </ul>
  //   </div>
  // );

  return (
    <div
      style={{
        backgroundImage: 'url("/login_box.jpg")', // ✅ Transparent background from public folder
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
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // ✅ Transparent overlay
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '700px',
          width: '90%',
          boxShadow: '0 0 15px rgba(0,0,0,0.2)',
          textAlign: 'center',
        }}
      >
        {exercises.length > 0 ? (
          <div className="exercise-cards">
            {exercises.map((exercise) => {
              const sub = exercise.subActivity?.trim();  // normalize empty strings to null/undefined
              // <div key={exercise.exerciseType} className="exercise-card">
              return (
                <div
                  key={`${exercise.exerciseType}-${exercise.subActivity || 'none'}`}
                  className="exercise-card"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '10px',
                    padding: '15px',
                    marginBottom: '15px',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                  }}
                >
                  <h5>{exercise.exerciseType}</h5>

                  {sub && (
                    <p>🏷 <strong>Sub Activity:</strong> {sub}</p>
                  )}

                <p>⏱ <strong>Duration:</strong> {exercise.totalDuration} minutes</p>
                {exercise.totalCalories != null && (
                    <p>🔥 <strong>Energy Burned:</strong> {exercise.totalCalories.toFixed(2)} kcal</p>
                )}
                
                {/* <p>🔥 <strong>Energy Burned:</strong> {exercise.totalCalories} kcal</p> */}
              </div>
              );
            })}
          </div>
        ) : (
          <p>🚫 No exercises found for today.</p>
        )}
      </div>
    </div>
  );
};

export default DailyStats;
