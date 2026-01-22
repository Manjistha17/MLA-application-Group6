import React, { useState, useEffect } from 'react';
import '../styles/components/Timer.css';

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
        if (isRunning) return;
        setError('');
        setIsRunning(true);
        if (time === 0) setStartTime(new Date());
    };

    const pauseTimer = () => {
        if (!isRunning) return;
        setIsRunning(false);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTime(0);
        setStartTime(null);
        setError('');
    };

    const stopTimer = () => {
        if (time === 0) return;

        setIsRunning(false);
        const endTime = new Date();

        const session = {
            startTime: startTime ? startTime.toISOString() : new Date().toISOString(),
            endTime: endTime.toISOString(),
            duration: time,
        };

        if (onTimerStop) onTimerStop(session);

        setTime(0);
        setStartTime(null);
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m
            .toString()
            .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="timer-container">
            {error && <div className="error-message">{error}</div>}

            {/* Gradient timer panel */}
            <div className="timer-panel">
                <div className="timer-display">{formatTime(time)}</div>
                <div className="timer-status">
                    {isRunning ? 'Exercise in progress' : 'Ready to start'}
                </div>
            </div>

            {/* Buttons */}
            <div className="timer-controls">
                {/* Fresh start */}
                {!isRunning && time === 0 && (
                    <button className="timer-btn start" onClick={startTimer}>
                        ▶ Start
                    </button>
                )}

                {/* Running */}
                {isRunning && (
                    <>
                        <button className="timer-btn pause" onClick={pauseTimer}>
                            ⏸ Pause
                        </button>
                        <button className="timer-btn stop" onClick={stopTimer}>
                            ⏹ Stop
                        </button>
                    </>
                )}

                {/* Paused / stopped with time */}
                {!isRunning && time > 0 && (
                    <>
                        <button className="timer-btn start" onClick={startTimer}>
                            ▶ Resume
                        </button>

                        <div className="timer-secondary">
                            <button className="timer-btn save" onClick={stopTimer}>
                                💾 Save
                            </button>
                            <button className="timer-btn reset" onClick={resetTimer}>
                                🔄 Reset
                            </button>
                        </div>
                    </>
                )}
            </div>


        </div>
    );
};

export default Timer;
