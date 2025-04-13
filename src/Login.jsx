import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API_BASE_URL from './config';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  console.log("🚀 VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);

  useEffect(() => {
    handleTokenLogin();
  }, []);

  const fetchWithTimeout = async (url, options, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
      }

      const API_PREFIX = '/api';
      const endpoint = mode === 'login'
        ? `${API_PREFIX}/auth/form-login`
        : `${API_PREFIX}/auth/form-register`;

      console.log(`🟡 Attempting ${mode} with username: ${username}`);

      const formData = new URLSearchParams();
      formData.append('username', username);

      const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `${mode} failed: ${response.status}`);
      }
const data = await response.json();
console.log("✅ Login/Register successful:", data);

// Store the session ID in localStorage for token-based auth fallback
if (data.session_id) {
  localStorage.setItem('auth_token', data.session_id);
  console.log("🔑 Saved auth token to localStorage");
}


      // Call the success handler passed from App.jsx
      onLoginSuccess(data);

    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenLogin = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      console.log("🔑 Trying token login");

      const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/verify-token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("🔓 Token verification successful:", data);
        
        // Call onLoginSuccess with the data
        onLoginSuccess({ username: data.username, access_token: token });

        // onLoginSuccess({ username: data.username, access_token: token });
      }
    } catch (error) {
      console.error("⚠️ Token login failed:", error);
      localStorage.removeItem('auth_token');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
      <motion.div
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Habit Hero</h1>
          <p className="text-gray-600">{mode === 'login' ? 'Sign in to continue' : 'Create a new account'}</p>
        </motion.div>

        {error && (
          <motion.div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
              required
            />
          </div>

          <motion.button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : mode === 'login' ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
