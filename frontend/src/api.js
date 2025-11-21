<<<<<<< HEAD
import axios from 'axios';

const api = axios.create({
  baseURL: '/', 
  headers: { 'Content-Type': 'application/json' },
  });

export const trackExercise = (payload) => api.post('exercises/add/', payload);
=======
import axios from 'axios';

function getUrl() {
    if (process.env.CODESPACES === "true") {
        return `https://${process.env.CODESPACE_NAME}-5300.app.github.dev`;
    } else {
        return `http://localhost:5300`;
    }
}

const baseURL = getUrl();

const api = axios.create({
    baseURL
});

export const trackExercise = payload => api.post(`/exercises/add`, payload);
>>>>>>> d38aa20 (feat: complete timer enhancement with pause/reset + login fixes + docker improvements)
