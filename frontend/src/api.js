import axios from 'axios';

const api = axios.create({
  baseURL: '/', 
  headers: { 'Content-Type': 'application/json' },
  });

export const trackExercise = (payload) => api.post('exercises/add/', payload);