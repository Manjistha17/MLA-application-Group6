import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DailyStats.css';

const DailyStats = ({ currentUser }) => {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        // URL without start and end params
        const url = `http://localhost:5050/stats/daily/`;
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
  <div className="journal-container">
    {exercises.length > 0 ? (
      <div className="exercise-cards">
        {exercises.map((exercise) => (
          // <div key={exercise.exerciseType} className="exercise-card">
          <div key={`${exercise.exerciseType}-${exercise.subActivity || 'none'}`} className="exercise-card">
            <h5>{exercise.exerciseType}</h5>
            <p>🏷 <strong>Sub Activity:</strong> {exercise.subActivity || '—'}</p>
            <p>⏱ <strong>Duration:</strong> {exercise.totalDuration} minutes</p>
            <p>🔥 <strong>Energy Burned:</strong> {exercise.totalCalories} kcal</p>
          </div>
        ))}
      </div>
    ) : (
      <p>🚫 No exercises found for today.</p>
    )}
  </div>
);


};

export default DailyStats;
