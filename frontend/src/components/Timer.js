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
        // Only set startTime if this is a fresh start (time is 0)
        if (time === 0) {
            setStartTime(new Date());
        }
    };

    const pauseTimer = () => {
        if (!isRunning) {
            setError('No active timer to pause');
            return;
        }
        setError('');
        setIsRunning(false);
    };

    const resetTimer = () => {
        setError('');
        setIsRunning(false);
        setTime(0);
        setStartTime(null);
    };

    const stopTimer = () => {
        if (time === 0) {
            setError('No duration recorded to save');
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
        
        // Reset timer after stopping
        setTime(0);
        setStartTime(null);
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
                    className={`timer-button start-button ${isRunning ? 'disabled' : ''}`}
                    disabled={isRunning}
                >
                    {time > 0 && !isRunning ? 'Resume' : 'Start'}
                </button>
                <button 
                    onClick={pauseTimer}
                    className={`timer-button pause-button ${!isRunning ? 'disabled' : ''}`}
                    disabled={!isRunning}
                >
                    Pause
                </button>
                <button 
                    onClick={stopTimer}
                    className={`timer-button stop-button ${time === 0 ? 'disabled' : ''}`}
                    disabled={time === 0}
                >
                    Stop & Save
                </button>
                <button 
                    onClick={resetTimer}
                    className={`timer-button reset-button ${time === 0 && !isRunning ? 'disabled' : ''}`}
                    disabled={time === 0 && !isRunning}
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default Timer;