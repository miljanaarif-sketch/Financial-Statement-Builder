import axios from 'axios';

const api = axios.create({ baseURL: '/_/backend' });
export default api;
