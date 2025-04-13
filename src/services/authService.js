import API_BASE_URL from '../config';

/**
 * Checks the current authentication status by verifying the session/token with the backend.
 * @returns {Promise<object|null>} User data object if authenticated, null otherwise.
 */
export const checkAuthStatus = async () => {
  try {
    console.log("Checking authentication status...");

    // Get token from localStorage if available
    const token = localStorage.getItem('auth_token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include', // Try cookies first
      headers: headers       // Fall back to token auth
    });

    console.log("Auth status response:", response.status);

    if (response.ok) {
      const userData = await response.json();
      console.log("User authenticated via checkAuthStatus:", userData);
      // Return only essential user info needed for auth context
      return { username: userData.username };
    } else {
      console.log("User not authenticated via checkAuthStatus, status:", response.status);
      return null;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    return null;
  }
};

/**
 * Logs the user out by clearing local token and calling the backend logout endpoint.
 * @returns {Promise<boolean>} True if logout was successful, false otherwise.
 */
export const logoutUser = async () => {
  try {
    // Also clear token from localStorage
    localStorage.removeItem('auth_token');

    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      // Log error but don't necessarily throw, as logout might partially succeed
      console.error('Backend logout failed:', response.status);
      // Still return true as we cleared local state
    }
    console.log("Logout successful.");
    return true;
  } catch (error) {
    console.error('Logout failed:', error);
    return false;
  }
};