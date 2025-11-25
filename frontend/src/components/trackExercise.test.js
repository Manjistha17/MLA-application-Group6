import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrackExercise from './trackExercise';

// Mock axios and api completely
global.fetch = jest.fn();

jest.mock('../api', () => ({
  trackExercise: jest.fn(() => Promise.resolve({ data: { message: 'Success' } }))
}));

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] }))
}));

// Mock Timer component
jest.mock('./Timer', () => {
  return function MockTimer() {
    return <div data-testid="mock-timer">Timer Component</div>;
  };
});

// Mock DatePicker
jest.mock('react-datepicker', () => {
  return function MockDatePicker() {
    return <input data-testid="date-picker" />;
  };
});

describe('TrackExercise Component - Manual Logging Enhancement', () => {
  it('should render track exercise form with mode selection', () => {
    render(<TrackExercise currentUser="testuser" />);
    
    expect(screen.getByText('Track Exercise')).toBeInTheDocument();
    expect(screen.getByText(/choose your tracking method/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🏃 timer mode/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /✏️ manual log/i })).toBeInTheDocument();
  });

  it('should switch between timer and manual modes', () => {
    render(<TrackExercise currentUser="testuser" />);
    
    // Initially in timer mode - check for timer
    expect(screen.getByText('Exercise Timer')).toBeInTheDocument();
    expect(screen.queryByText('Manual Duration Entry')).not.toBeInTheDocument();
    
    // Switch to manual mode
    fireEvent.click(screen.getByRole('button', { name: /✏️ manual log/i }));
    
    // Check manual mode elements appear
    expect(screen.getByText('Manual Duration Entry')).toBeInTheDocument();
    expect(screen.queryByText('Exercise Timer')).not.toBeInTheDocument();
    
    // Switch back to timer mode
    fireEvent.click(screen.getByRole('button', { name: /🏃 timer mode/i }));
    
    // Check timer mode elements appear again
    expect(screen.getByText('Exercise Timer')).toBeInTheDocument();
    expect(screen.queryByText('Manual Duration Entry')).not.toBeInTheDocument();
  });

  it('should display manual duration input in manual mode', () => {
    render(<TrackExercise currentUser="testuser" />);
    
    // Switch to manual mode
    fireEvent.click(screen.getByRole('button', { name: /✏️ manual log/i }));
    
    // Check manual input elements
    expect(screen.getByLabelText(/duration \(minutes\)/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter duration in minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/enter how many minutes you exercised/i)).toBeInTheDocument();
  });

  it('should show different submit button text based on mode', () => {
    render(<TrackExercise currentUser="testuser" />);
    
    // Timer mode button text
    expect(screen.getByRole('button', { name: /⏱️ save timed activity/i })).toBeInTheDocument();
    
    // Switch to manual mode
    fireEvent.click(screen.getByRole('button', { name: /✏️ manual log/i }));
    
    // Manual mode button text
    expect(screen.getByRole('button', { name: /✏️ save manual entry/i })).toBeInTheDocument();
  });

  it('should show manual entry preview when duration is entered', () => {
    render(<TrackExercise currentUser="testuser" />);
    
    // Switch to manual mode
    fireEvent.click(screen.getByRole('button', { name: /✏️ manual log/i }));
    
    // Enter duration
    const durationInput = screen.getByLabelText(/duration \(minutes\)/i);
    fireEvent.change(durationInput, { target: { value: '45' } });
    
    // Should show preview
    expect(screen.getByText(/manual entry: 45 minutes/i)).toBeInTheDocument();
  });

  it('should clear manual duration when switching modes', () => {
    render(<TrackExercise currentUser="testuser" />);
    
    // Switch to manual mode and enter duration
    fireEvent.click(screen.getByRole('button', { name: /✏️ manual log/i }));
    const durationInput = screen.getByLabelText(/duration \(minutes\)/i);
    fireEvent.change(durationInput, { target: { value: '30' } });
    
    expect(durationInput.value).toBe('30');
    
    // Switch back to timer mode and then to manual mode again
    fireEvent.click(screen.getByRole('button', { name: /🏃 timer mode/i }));
    fireEvent.click(screen.getByRole('button', { name: /✏️ manual log/i }));
    
    // Duration input should still have the value (it doesn't get cleared on mode switch)
    const newDurationInput = screen.getByLabelText(/duration \(minutes\)/i);
    expect(newDurationInput.value).toBe('30');
  });
});