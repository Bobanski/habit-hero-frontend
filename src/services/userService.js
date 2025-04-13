import API_BASE_URL from '../config';

// Function to load user data from backend
// Note: This function now returns the data or throws an error,
// instead of directly setting state.
export const loadUserData = async () => {
  console.log("Loading user data...");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  // Get token from localStorage if available
  const token = localStorage.getItem('auth_token');
  const headers = token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : { 'Content-Type': 'application/json' };

  try {
    const response = await fetch(`${API_BASE_URL}/api/user`, {
      credentials: 'include',  // Try cookies first
      headers: headers,        // Fall back to token auth
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log("User data response:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("User data loaded:", data);

      // Clean up UI-specific fields before returning
      const cleanedHabits = (data.habits || []).map(habit => ({
        ...habit,
        selected: false // Always reset selected on load
      }));

      return {
        xp: data.xp || 0,
        level: data.level || 1,
        habits: cleanedHabits,
        prs: data.prs || [],
        todos: data.todos || [],
        lastLoginDate: data.lastLoginDate, // Include last login date
        dailyStreak: data.dailyStreak || 0 // Include daily streak
      };
    } else {
      const errorText = await response.text();
      console.error("Failed to load user data:", errorText);
      throw new Error(`Failed to load user data: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Failed to load user data: Request timed out');
      throw new Error('Failed to load user data: Request timed out');
    }
    console.error('Failed to load user data:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};


// Function to save user data to backend
export const saveUserData = async (dataToSave) => {
  try {
    // Get token from localStorage if available
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(`${API_BASE_URL}/api/user`, {
      method: 'POST',
      headers: headers,
      credentials: 'include', // Try cookies first
      body: JSON.stringify(dataToSave),
    });

    if (!response.ok) {
      throw new Error(`Failed to save: ${response.status}`);
    }

    console.log("User data saved successfully.");
    return true; // Indicate success
  } catch (error) {
    console.error('Failed to save user data:', error);
    return false; // Indicate failure
  }
};