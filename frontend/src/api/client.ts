import axios from 'axios';

// In development: Vite proxies /upload, /mapping etc. → localhost:8000
// In production (Vercel experimentalServices): backend is served at /_/backend
const isProd = import.meta.env.PROD;
const api = axios.create({ baseURL: isProd ? '/api' : '' });
export default api;
