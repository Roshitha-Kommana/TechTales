/**
 * Centralized API configuration
 * 
 * Uses environment variable if available, otherwise falls back to local development server.
 * 
 * To use a deployed backend, set the environment variable:
 * - REACT_APP_API_URL=https://techtales-backend-43df.onrender.com
 */

export const getApiBaseUrl = (): string => {
  // Support for Create React App (react-scripts)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Default fallback for local development
  return 'http://localhost:5000';
};

export const BASE_URL = getApiBaseUrl();

// Debug: Log which API URL is being used (optional)
console.log('[API Config] Using BASE_URL:', BASE_URL);
