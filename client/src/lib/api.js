import axios from 'axios';

/**
 * Pre-configured Axios instance for API calls.
 * - Uses the Vite proxy in development (/api → localhost:5000)
 * - Uses VITE_API_URL in production
 * - Sends cookies with every request (withCredentials)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
