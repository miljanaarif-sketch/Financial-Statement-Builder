import axios from 'axios';

// In development, Vite proxies /upload, /mapping etc. to localhost:8000
// In production (Vercel), rewrites forward them to the serverless function directly
const api = axios.create({ baseURL: '' });
export default api;
