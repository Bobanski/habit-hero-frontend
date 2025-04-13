import { useState, useEffect, useCallback } from 'react';
import { checkAuthStatus, logoutUser } from '../services/authService';
import { loadUserData } from '../services/userService'; // Need this to load data after auth check

export function useAuth() {
  const [user, setUser] = useState(null); // Stores user data { username: '...' } or null
  const [isLoading, setIsLoading] = useState(true); // Tracks initial auth check loading state
  const [userData, setUserData] = useState(null); // Stores full user data after load

  // Function to check authentication status on initial load
  const verifyAuth = useCallback(async () => {
    setIsLoading(true);
    let finalUser = null;
    let finalUserData = null;
    try {
      finalUser = await checkAuthStatus();
      if (finalUser) {
        try {
          finalUserData = await loadUserData();
        } catch (error) {
          console.error("Failed to load user data after auth check:", error);
          // Keep basic user info but clear detailed data if load fails
          finalUserData = null;
          // Optionally: Log out user completely if data load is critical
          // finalUser = null;
        }
      }
    } catch (authError) {
        console.error("Auth check itself failed:", authError);
        finalUser = null;
        finalUserData = null;
    } finally {
        // Set state only once at the end
        setUser(finalUser);
        setUserData(finalUserData);
        setIsLoading(false);
    }
  }, []);

  // Run verification on mount
  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  // Logout function
  const logout = useCallback(async () => {
    const success = await logoutUser();
    if (success) {
      setUser(null); // Clear user state
      setUserData(null); // Clear detailed user data
    }
    // Optionally handle logout failure (e.g., show message)
    return success;
  }, []);

  // Function to handle successful login (called from Login component)
  const handleLoginSuccess = useCallback((loggedInUserData) => {
    // We trust the Login component provides basic user info
    setUser({ username: loggedInUserData.username });
    // Trigger a reload of full user data
    // This implicitly handles the daily bonus logic within loadUserData/handleDailyLoginBonus coordination
    // which will likely need to be refactored into the hook system later.
    // For now, just reload.
    setIsLoading(true); // Show loading while fetching fresh data
    loadUserData()
      .then(fullData => {
        setUserData(fullData);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to load user data after login:", error);
        // Handle error, maybe revert user state?
        setUser(null);
        setUserData(null);
        setIsLoading(false);
      });
  }, []);


  return {
    user,          // Basic user info ({ username: '...' } or null)
    userData,      // Full user data (xp, level, habits, etc.) or null
    isLoading,     // Loading state for initial auth check/data load
    logout,        // Logout function
    handleLoginSuccess, // Function to call after login API succeeds
    reloadUserData: verifyAuth // Expose function to manually reload data if needed
  };
}