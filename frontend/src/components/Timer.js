import React, { useState, useEffect } from 'react';
import './Timer.css';

// Timer is intentionally UI-only now: it starts/stops and reports session data
// to the parent via onTimerStop. The parent (TrackExercise) is responsible
// for persisting the session (so existing auth flows are reused).
const Timer = ({ onTimerStop }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let intervalId;
        if (isRunning) {
            intervalId = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(intervalId);
    }, [isRunning]);

    const startTimer = () => {
        if (isRunning) {
            setError('Timer is already running');
            return;
        }
        setError('');
        setIsRunning(true);
        setStartTime(new Date());
        setTime(0);
    };

    const stopTimer = () => {
        if (!isRunning) {
            setError('No active timer to stop');
            return;
        }
        setError('');
        setIsRunning(false);
        const endTime = new Date();
        const duration = time; // seconds

        const session = {
            startTime: startTime ? startTime.toISOString() : new Date().toISOString(),
            endTime: endTime.toISOString(),
            duration
        };

        // Report session to parent and let parent handle persistence/auth
        if (onTimerStop) onTimerStop(session);
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="timer-container">
            {error && <div className="error-message">{error}</div>}
            <div className="timer-display">{formatTime(time)}</div>
            {/* No direct persistence here; parent receives the session on stop */}
            <div className="timer-controls">
                <button 
                    onClick={startTimer}
                    className={`timer-button ${isRunning ? 'disabled' : ''}`}
                    disabled={isRunning}
                >
                    Start Timer
                </button>
                <button 
                    onClick={stopTimer}
                    className={`timer-button ${!isRunning ? 'disabled' : ''}`}
                    disabled={!isRunning}
                >
                    Stop Timer
                </button>
            </div>
        </div>
    );
};

export default Timer;