import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Number of retries for failed requests
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // ms

// Global state to track retry status
export const retryState = {
  isRetrying: false,
  retryCount: 0,
  maxRetries: MAX_RETRIES,
  pendingRetries: 0,
  
  // Notify listeners when state changes
  listeners: [],
  
  // Add a listener for state changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },
  
  // Update state and notify listeners
  update(updates) {
    Object.assign(this, updates);
    this.listeners.forEach(listener => listener(this));
  }
};

// Add a response interceptor to handle common error scenarios
api.interceptors.response.use(
  (response) => {
    // If this was a retry that succeeded, update the retry state
    if (response.config._retry) {
      retryState.update({
        pendingRetries: retryState.pendingRetries - 1,
        isRetrying: retryState.pendingRetries > 1
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to rate limiting and we haven't retried too many times
    if (error.response && error.response.status === 429 && (!originalRequest._retry || originalRequest._retry < MAX_RETRIES)) {
      originalRequest._retry = originalRequest._retry ? originalRequest._retry + 1 : 1;
      
      if (originalRequest._retry <= MAX_RETRIES) {
        // Update retry state
        retryState.update({
          isRetrying: true,
          retryCount: originalRequest._retry,
          pendingRetries: retryState.pendingRetries + 1
        });
        
        toast.info(`Request limit reached. Retrying in ${RETRY_DELAY/1000}s... (${originalRequest._retry}/${MAX_RETRIES})`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        
        return api(originalRequest);
      }
    }
    
    // If this was a retry that failed, update the retry state
    if (originalRequest._retry) {
      retryState.update({
        pendingRetries: retryState.pendingRetries - 1,
        isRetrying: retryState.pendingRetries > 0
      });
    }
    
    // Handle auth errors
    if (error.response && error.response.status === 401) {
      // Clear stored tokens if auth is invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only show message if it's not a login/register endpoint
      if (!originalRequest.url.includes('auth')) {
        toast.error('Your session has expired. Please log in again.');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
