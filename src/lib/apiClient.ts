import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

// Add response interceptor to unwrap the data
apiClient.interceptors.response.use(
  (response) => {
    // If response has data.data structure, unwrap it
    if (response.data && response.data.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
