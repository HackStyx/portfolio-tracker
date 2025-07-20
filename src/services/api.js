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
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('🔍 API Request Debug:', {
        url: config.url,
        method: config.method,
        hasSession: !!session,
        hasToken: !!session?.access_token,
        tokenPreview: session?.access_token ? `${session.access_token.substring(0, 20)}...` : 'No token'
      });
      
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        console.log('✅ Auth token added to request');
      } else {
        console.log('❌ No auth token available');
      }
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response success:', response.config.url);
    return response;
  },
  async (error) => {
    console.error('❌ API Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.error || error.message
    });
    
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      console.log('🔐 Authentication failed, redirecting to login...');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api; 