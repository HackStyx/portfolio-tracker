import axios from 'axios';
import { supabase } from '../config/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalConfig = error.config;

    // Avoid infinite loops
    if (status === 401 && originalConfig && !originalConfig._authRetry) {
      originalConfig._authRetry = true;
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      if (!refreshError && refreshData?.session?.access_token) {
        originalConfig.headers.Authorization = `Bearer ${refreshData.session.access_token}`;
        return api.request(originalConfig);
      }

      await supabase.auth.signOut();
      // Use replace so we don't stack entries; avoid hard reload when already on /
      if (window.location.pathname !== '/') {
        window.location.replace(`${window.location.origin}/`);
      }
    }

    return Promise.reject(error);
  }
);

export default api; 