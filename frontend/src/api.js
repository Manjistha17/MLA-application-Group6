import axios from 'axios';

const api = axios.create({
  baseURL: '/', 
  headers: { 'Content-Type': 'application/json' },
  });

export const trackExercise = (payload) => api.post('http://16.171.162.5:5300/exercises/add/', payload);