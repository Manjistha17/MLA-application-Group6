import axios from 'axios';

const api = axios.create({
  baseURL: '/', 
  headers: { 'Content-Type': 'application/json' },
  });

export const trackExercise = (payload) => api.post('https://d393qv373r18to.cloudfront.net/exercises/add/', payload);