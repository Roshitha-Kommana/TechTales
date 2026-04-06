import { authApi } from '../services/auth';
import api from '../services/api';

/**
 * Validates the current token by making a test API call
 * If token is invalid, clears it and returns false
 */
export const validateToken = async (): Promise<boolean> => {
  const token = authApi.getToken();
  
  if (!token) {
    return false;
  }

  try {
    // Try to get current user - this validates the token
    const response = await api.get('/auth/me');
    return response.data.success === true;
  } catch (error: any) {
    // Token is invalid - clear it
    if (error.response?.status === 401 || error.response?.status === 403) {
      authApi.logout();
      return false;
    }
    return false;
  }
};
