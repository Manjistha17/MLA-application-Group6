import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './statistics.css';

const Statistics = ({ currentUser }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const url = `http://localhost:5050/stats/${currentUser}`;

    axios.get(url)
      .then(response => {
        setData(response.data.stats);
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  }, [currentUser]);

  const currentUserData = data.find(item => item.username === currentUser);

  return (
    <div
      style={{
        backgroundImage: 'url("/login_box.jpg")', // ✅ from public folder
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
        className="stats-container"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '600px',
          width: '90%',
          boxShadow: '0 0 15px rgba(0,0,0,0.2)',
          textAlign: 'center',
        }}
      >
        <h4>Well done, {currentUser}! This is your overall effort:</h4>
        {currentUserData ? (
          currentUserData.exercises.map((item, index) => (
            <div key={index} className="exercise-data">
              <div><strong>{item.exerciseType}</strong></div>
              <div>Total Duration: {item.totalDuration} min</div>
            </div>
          ))
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

export default Statistics;
