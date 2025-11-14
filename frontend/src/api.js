import axios from 'axios';

// function getUrl() {
//     if (process.env.CODESPACES === "true") {
//         return `https://${process.env.CODESPACE_NAME}-5300.app.github.dev`;
//     } else {
//         return `http://localhost:5300`;
//     }
// }

// const baseURL = getUrl();

// const api = axios.create({
//     baseURL
// });

const api = axios.create({
  baseURL: '/', // No hardcoding localhost or port
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Export your API calls
export const trackExercise = (payload) => api.post('exercises/add/', payload);


