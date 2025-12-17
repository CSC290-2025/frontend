import axios from 'axios';

export const getBaseAPIURL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: getBaseAPIURL,
  withCredentials: true,
});
