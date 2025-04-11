import { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './Login';
import ProgressDashboard from './ProgressDashboard';
import './App.css';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from './config';
import { useNavigate } from 'react-router-dom';

// Enhanced XP Bar Component with Neon Glow Effect
const XPBar = ({ xp, maxXp, previewXp = 0 }) => {
  const actualPercentage = Math.min((xp / maxXp) * 100, 100);
  const totalPercentage = Math.min(((xp + previewXp) / maxXp) * 100, 100);
  const isNearLevelUp = actualPercentage > 80;
  
  return (
    <div className="w-full bg-gray-300 rounded-full h-4 overflow-visible relative my-2">
      {/* Shadow backdrop for depth */}
      <div className="absolute inset-0 rounded-full shadow-inner"></div>
      
      {/* Base XP bar */}
      <motion.div
        className={`h-full absolute left-0 top-0 rounded-full 
                   ${isNearLevelUp ? 'bg-green-400' : 'bg-green-500'}`}
        style={{ width: `${actualPercentage}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${actualPercentage}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />
      
      {/* Neon glow effect when near level up */}
      {isNearLevelUp && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ 
            width: `${actualPercentage}%`,
            boxShadow: `
              0 0 5px 2px rgba(34, 197, 94, 0.3),
              0 0 10px 4px rgba(34, 197, 94, 0.2),
              0 0 15px 6px rgba(34, 197, 94, 0.1)
            `,
            filter: 'blur(0px)'
          }}
          animate={{ 
            boxShadow: [
              `0 0 5px 2px rgba(34, 197, 94, 0.3), 0 0 10px 4px rgba(34, 197, 94, 0.2), 0 0 15px 6px rgba(34, 197, 94, 0.1)`,
              `0 0 7px 3px rgba(34, 197, 94, 0.4), 0 0 14px 6px rgba(34, 197, 94, 0.3), 0 0 20px 8px rgba(34, 197, 94, 0.2)`,
              `0 0 5px 2px rgba(34, 197, 94, 0.3), 0 0 10px 4px rgba(34, 197, 94, 0.2), 0 0 15px 6px rgba(34, 197, 94, 0.1)`
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      {/* Additional glowing particles for level-up readiness */}
      {actualPercentage > 90 && (
        <>
          <motion.div 
            className="absolute h-8 w-8 rounded-full bg-green-400 opacity-0 top-1/2 transform -translate-y-1/2"
            style={{ left: `${Math.min(95, actualPercentage)}%` }}
            animate={{ 
              opacity: [0, 0.2, 0],
              scale: [1, 1.5, 1],
              x: [0, -20, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
          />
          <motion.div 
            className="absolute h-6 w-6 rounded-full bg-green-400 opacity-0 top-1/2 transform -translate-y-1/2"
            style={{ left: `${Math.min(80, actualPercentage)}%` }}
            animate={{ 
              opacity: [0, 0.3, 0],
              scale: [1, 1.3, 1],
              x: [0, 15, 0]
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5, repeatType: "mirror" }}
          />
        </>
      )}
      
      {/* Inner highlight for dimension */}
      <motion.div
        className="absolute h-full top-0 left-0 rounded-full opacity-40 bg-gradient-to-b from-white to-transparent"
        style={{ 
          width: `${actualPercentage}%`,
          height: '50%'
        }}
      />
      
      {/* Preview XP - only shown if there's preview XP */}
      {previewXp > 0 && (
        <motion.div
          className="bg-green-300 h-full absolute top-0 rounded-r-full"
          style={{ 
            width: `${totalPercentage - actualPercentage}%`, 
            left: `${actualPercentage}%` 
          }}
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: `${totalPercentage - actualPercentage}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.2 }}
        />
      )}
      
      {/* Edge highlight to create lightsaber effect */}
      {isNearLevelUp && (
        <motion.div 
          className="absolute top-0 h-full rounded-r-full bg-white" 
          style={{ 
            left: `${actualPercentage - 1}%`,
            width: '2px',
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  );
};

// Habit Item Component with improved styling and animations
const HabitItem = ({ habit, onChange, editable, multiplier = 1 }) => {
  // Calculate the actual XP with multiplier
  const actualXp = Math.round(habit.xp * multiplier);
  const showMultiplier = multiplier > 1;
  
  return (
    <div className={`flex items-center justify-between p-3 border-b border-gray-200 ${habit.selected ? 'bg-gray-50' : ''} hover:bg-gray-50 transition-colors`}>
      {/* Left side: Checkbox + Habit name */}
      <div className="flex items-start space-x-2">
        <div className="relative">
          <input 
            type="checkbox" 
            checked={habit.selected}
            onChange={() => onChange(habit.id)}
            disabled={!editable}
            className="w-4 h-4 mt-0.5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
          />
          {/* Animated checkmark overlay */}
          <AnimatePresence>
            {habit.selected && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <span className="text-green-500 text-xs">✓</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-col">
          <span className={`${habit.selected ? 'text-gray-800 font-medium' : 'text-gray-700'} truncate max-w-[140px] text-sm`}>
            {habit.name}
          </span>
          
          {/* Only show streak info if there's a streak */}
          {habit.streak > 1 && (
            <motion.span 
              className="text-xs text-orange-600 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {habit.streak} day streak
            </motion.span>
          )}
        </div>
      </div>
      
      {/* Right side: XP reward */}
      <div>
        <motion.span 
          className={`text-xs ${showMultiplier ? 'text-orange-500 font-medium' : 'text-gray-600'}`}
          whileHover={{ scale: 1.1 }}
          title={showMultiplier ? `Base: ${habit.xp}XP × ${multiplier.toFixed(1)} multiplier` : undefined}
        >
          +{actualXp} XP
          {showMultiplier && (
            <motion.span 
              className="text-xs ml-0.5" 
              title="Includes streak bonus"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
            >
              ↑
            </motion.span>
          )}
        </motion.span>
      </div>
    </div>
  );
};

// Streak Item Component for Active Streaks panel
const StreakItem = ({ habit }) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
      <span className="text-sm text-gray-700 truncate max-w-[140px]">{habit.name}</span>
      <motion.span 
        className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full flex items-center gap-x-1"
        whileHover={{ scale: 1.1 }}
        initial={{ scale: 0.9, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
      >
        <motion.span
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
        >
          🔥
        </motion.span>
        <span>{habit.streak}</span>
      </motion.span>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [habits, setHabits] = useState([]);
  const [personalRecords, setPersonalRecords] = useState([]);
  const [todos, setTodos] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitXp, setNewHabitXp] = useState(10); // default XP for new habits
  const [activePanel, setActivePanel] = useState(null);
  const navigate = useNavigate();


  // Add this with your other state variables
  const [view, setView] = useState("dashboard"); // "dashboard" or "analytics"

  // Add state for personal records management
  const [newPrName, setNewPrName] = useState('');
  const [newPrValue, setNewPrValue] = useState('');
  const [newPrUnit, setNewPrUnit] = useState('reps'); // Default unit type

  // Add state for To-Dos management
  const [newTodo, setNewTodo] = useState('');

  // Add this state for XP gain animation
  const [xpGainAnimation, setXpGainAnimation] = useState({ show: false, amount: 0 });

  // Add state to track level ups
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Calculate XP required based on current level
  const getMaxXpForLevel = (currentLevel) => {
    return 100 + (currentLevel - 1) * 10;
  };
  
  const maxXp = getMaxXpForLevel(level);
  
  // Calculate streak multiplier - 0.1x per streak habit, max 1.5x
  const calculateStreakMultiplier = () => {
    // Count habits with streak >= 2
    const streakHabits = habits.filter(habit => habit.streak >= 2).length;
    // 0.1x per streak, baseline is 1.0x, cap at 1.5x
    return Math.min(1 + (streakHabits * 0.1), 1.5);
  };

  const streakMultiplier = calculateStreakMultiplier();
  
  // Get active streaks
  const activeStreaks = habits.filter(habit => habit.streak >= 2);
  
  // Dynamically reference the avatar image based on the current level
  const getAvatarImage = (level) => {
    // We have images for levels 1-3
    const maxImageLevel = 3;
    // If the level is higher than what we have images for, use the highest one we have
    const imageLevel = level > maxImageLevel ? maxImageLevel : level;
    // Return the avatar image path based on the level
    return `/Rogue_lvl_0${imageLevel}.png`;
  };
  
  const avatarImage = getAvatarImage(level);

  // Function to handle XP gain and level up with streak multiplier applied
  const gainXP = async (amount) => {
    // Apply streak multiplier to XP gain
    const multipliedXp = Math.round(amount * streakMultiplier);
    const newXP = xp + multipliedXp;
    
    // Variables to track changes
    let newLevel = level;
    let remainderXp = newXP;
    
    // Check if the player should level up
    if (newXP >= maxXp) {
      // Level up and reset XP (keeping overflow XP)
      newLevel = level + 1;
      remainderXp = newXP - maxXp;
      
      // Update state
      setLevel(newLevel);
      setXp(remainderXp);
      
      // Trigger level up animation
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    } else {
      // Just update XP
      setXp(newXP);
    }
    
    // Save the updated data immediately - await the promise
    try {
      await saveUserData({
        xp: remainderXp,
        level: newLevel,
        habits,
        prs: personalRecords,
        todos
      });
      console.log("Data saved successfully after XP gain");
    } catch (error) {
      console.error("Failed to save data after XP gain:", error);
    }
    
    return multipliedXp; // Return the actual XP gained for display
  };

  // Toggle selection of a habit
  const toggleHabitSelection = (habitId) => {
    setHabits(habits.map(habit => 
      habit.id === habitId ? { ...habit, selected: !habit.selected } : habit
    ));
  };

  // Update the submitHabits function to ensure selections are saved as cleared

const submitHabits = async () => {
  let totalXpGained = 0;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Mark selected habits as completed and update streaks
  const updatedHabits = habits.map(habit => {
    if (habit.selected) {
      // Calculate streak
      let newStreak = 1; // Default to 1 for completed habits
      
      if (habit.lastCompletedDate) {
        // If this habit was completed before, check if it's a consecutive day
        // In a real app, you'd compare actual dates
        // For this demo, we'll just increment streak if it was completed before
        newStreak = habit.streak + 1;
      }
      
      // Calculate base XP for this habit
      const baseXp = habit.xp;
      totalXpGained += baseXp;
      
      // Return updated habit
      return { 
        ...habit, 
        selected: false, // Explicitly set to false
        lastCompletedDate: today,
        streak: newStreak
      };
    }
    return habit;
  });
  
  // Update habits state
  setHabits(updatedHabits);
  
  // Save data for habits immediately - make sure to save the updated habits with selected: false
  await saveUserData({
    xp,
    level,
    habits: updatedHabits,
    prs: personalRecords,
    todos
  });
  
  // Add XP gain with multiplier (the actual XP awarded)
  if (totalXpGained > 0) {
    const actualXpGained = await gainXP(totalXpGained);
    
    // Trigger XP gain animation
    setXpGainAnimation({ show: true, amount: actualXpGained });
    setTimeout(() => setXpGainAnimation({ show: false, amount: 0 }), 2000);
  }
  
  // Close the habits panel
  setActivePanel(null);
};

  // Add a function to handle habit creation
  const addNewHabit = (e) => {
    e.preventDefault();
    if (newHabitName.trim() === '') return;
    
    const newHabit = {
      id: Date.now(), // Use timestamp as ID
      name: newHabitName.trim(),
      completed: false,
      selected: false,
      xp: newHabitXp,
      streak: 0,
      lastCompletedDate: null
    };
    
    setHabits([...habits, newHabit]);
    setNewHabitName('');
  };

  // Function to add a new personal record
  const addPersonalRecord = (e) => {
    e.preventDefault();
    if (newPrName.trim() === '' || isNaN(newPrValue) || newPrValue < 0) return;
    
    const newRecord = {
      id: Date.now(),
      name: newPrName.trim(),
      current: parseInt(newPrValue),
      unit: newPrUnit
    };
    
    setPersonalRecords([...personalRecords, newRecord]);
    setNewPrName('');
    setNewPrValue('');
  };

  // Function to handle tying a PR
  const tiePR = (recordId) => {
    // Award exactly 25 XP (without multiplier)
    const xpGained = 25;
    
    // Use gainXP function but ignore the multiplier by dividing by it first
    const actualXpGained = gainXP(xpGained);
    
    // Trigger XP gain animation
    setXpGainAnimation({ show: true, amount: actualXpGained });
    setTimeout(() => setXpGainAnimation({ show: false, amount: 0 }), 2000);
    
    // No need for alert as we're showing the XP animation
  };

  // Function to handle beating a PR - update to maintain unit
const beatPR = (recordId) => {
  // Find the record
  const record = personalRecords.find(r => r.id === recordId);
  if (!record) return;
  
  // Prompt for new value
  const newValue = prompt(`You beat your ${record.name} PR of ${record.current} ${record.unit}! Enter your new record:`);
  if (!newValue || isNaN(newValue) || parseInt(newValue) <= record.current) {
    alert("Please enter a valid number higher than your current record.");
    return;
  }
  
  // Update the record
  setPersonalRecords(personalRecords.map(r => 
    r.id === recordId ? { ...r, current: parseInt(newValue) } : r
  ));
  
  // Award exactly 50 XP (without multiplier)
  const xpGained = 50;
  
  // Use gainXP function but ignore the multiplier by dividing by it first
  const actualXpGained = gainXP(xpGained);
  
  // Trigger XP gain animation
  setXpGainAnimation({ show: true, amount: actualXpGained });
  setTimeout(() => setXpGainAnimation({ show: false, amount: 0 }), 2000);
};

  // Reset all habits
  const resetHabits = () => {
    const resetHabitsArray = habits.map(habit => ({
      ...habit,
      completed: false,
      selected: false
    }));
    setHabits(resetHabitsArray);
    setActivePanel(null);
  };

  // Function to add a new To-Do
  const addTodo = (e) => {
    e.preventDefault();
    if (newTodo.trim() === '') return;
    
    const newItem = {
      id: Date.now(),
      text: newTodo.trim(),
      completed: false
    };
    
    setTodos([...todos, newItem]);
    setNewTodo('');
  };

  // Function to toggle a To-Do completion
  const toggleTodo = (todoId) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === todoId) {
        // If we're marking as completed and it wasn't completed before
        if (!todo.completed) {
          // Award exactly 5 XP (without multiplier)
          const xpGained = 5;
          
          // Use gainXP function
          const actualXpGained = gainXP(xpGained);
          
          // Trigger XP gain animation
          setXpGainAnimation({ show: true, amount: actualXpGained });
          setTimeout(() => setXpGainAnimation({ show: false, amount: 0 }), 2000);
        }
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    
    setTodos(updatedTodos);
  };

  // Calculate stats
  const completedHabits = habits.filter(habit => habit.completed).length;
  const selectedHabits = habits.filter(habit => habit.selected).length;
  
  // Calculate base XP from selected habits (before multiplier)
  const baseXpSelected = habits
    .filter(habit => habit.selected)
    .reduce((sum, habit) => sum + habit.xp, 0);
    
  // Calculate total XP with multiplier applied
  const totalXpSelected = Math.round(baseXpSelected * streakMultiplier);

  // Calculate preview XP (from selected but not yet submitted habits)
  const previewXp = totalXpSelected;

  // Then replace the separate isXOpen states with a single function
  const isPanelOpen = (panelName) => activePanel === panelName;
  const openPanel = (panelName) => {
    // Close current panel if clicking the same one, otherwise open the new one
    setActivePanel(activePanel === panelName ? null : panelName);
  };

  // Check if user is already logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        console.log("Checking authentication status...");
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include', // Important for cookies
        });
        
        console.log("Auth status response:", response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log("User authenticated:", userData);
          setUser(userData);
          
          // Load user data immediately
          loadUserData();
        } else {
          console.log("User not authenticated, status:", response.status);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, []);
  
  // Function to load user data from backend
const loadUserData = async () => {
  try {
    console.log("Loading user data...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE_URL}/api/user`, {
      credentials: 'include',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log("User data response:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("User data loaded:", data);

      // Always use what the backend provides, just clean up UI-specific fields
      const cleanedHabits = (data.habits || []).map(habit => ({
        ...habit,
        selected: false // Always reset selected on load
      }));

      setXp(data.xp || 0);
      setLevel(data.level || 1);
      setHabits(cleanedHabits);
      setPersonalRecords(data.prs || []);
      setTodos(data.todos || []);
    } else {
      console.error("Failed to load user data:", await response.text());
    }
  } catch (error) {
    console.error('Failed to load user data:', error);
  } finally {
    setIsLoading(false);
  }
};
  

  
  
  // Function to save user data to backend
  const saveUserData = async (dataToSave = null) => {
    try {
      // Use provided data or current state
      const data = dataToSave || {
        xp,
        level,
        habits,
        prs: personalRecords,
        todos
      };
      
      const response = await fetch(`${API_BASE_URL}/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status}`);
      }
      
      return true; // Indicate success
    } catch (error) {
      console.error('Failed to save user data:', error);
      return false; // Indicate failure
    }
  };

  const handleLogout = async () => {
    try {
      // Also clear token from localStorage
      localStorage.removeItem('auth_token');
      
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const handleLoginSuccess = (userData) => {
    console.log("Login successful:", userData);
  
    // Set user state
    setUser({ username: userData.username });
  
    // Wait briefly to allow cookies to set, then re-check auth
    setTimeout(async () => {
      try {
        const check = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: 'include'
        });
  
        if (check.ok) {
          console.log("Cookie confirmed, now loading user data");
          await loadUserData();
        } else {
          console.warn("Cookie still not recognized, retrying in 200ms...");
          setTimeout(() => loadUserData(), 200);
        }
      } catch (err) {
        console.error("Auth recheck failed:", err);
      }
    }, 150);
  };
  
  
  // Simplified loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Habit Hero...</p>
        </div>
      </div>
    );
  }
  
  // Show login page if not logged in
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }
  
  // Use React Router for routing
  return (

    <Routes>
      <Route path="/progress" element={
        <ProgressDashboard 
          userData={{ 
            username: user?.username, 
            level,
            xp,
            habits, 
            prs: personalRecords,
            todos
          }}
        />
      } />
      <Route path="/" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
          {/* User info/logout button - keep this as is */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Logged in as <span className="font-bold">{user.username}</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded"
            >
              Logout
            </button>
            {/* Replace analytics button with router link */}
            <button
              onClick={() => {
                console.log('Navigating to progress page');
                navigate('/progress');
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              View Progress
            </button>
          </div>
          
          {/* Rest of your dashboard code */}
          <div className="grid grid-cols-3 grid-rows-3 gap-8 w-full max-w-4xl aspect-square">
            {/* Top Left: Daily Habits */}
            <div className="col-start-1 col-span-1 row-start-1 row-span-1 flex items-start justify-start">
              {/* Keep existing habits panel content */}
              {!isPanelOpen('habits') ? (
                <button
                  onClick={() => openPanel('habits')}
                  className="bg-white rounded-lg shadow-md py-2 px-4 hover:bg-blue-50 transition-all duration-300 flex items-center space-x-2 border-l-4 border-blue-500"
                >
                  <span className="text-xl">✅</span>
                  <div className="text-left">
                    <span className="font-bold text-gray-800 block">Daily Habits</span>
                    <span className="text-xs text-gray-500">{completedHabits}/{habits.length} completed</span>
                  </div>
                </button>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-xs sm:max-w-sm md:max-w-md max-h-[80vh] overflow-auto z-20 border-l-4 border-blue-500 origin-top-left">
                  {/* Existing habits panel content */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-800 flex items-center">
                      <span className="mr-2">✅</span>
                      <span>Daily Habits</span>
                    </h3>
                    <button 
                      onClick={() => openPanel(null)}
                      className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 011.414 0L10 8.586l4.293-4.293a1 1 111.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Add new habit form */}
                  <form onSubmit={addNewHabit} className="mb-3">
                    <div className="flex items-center mb-2">
                      <input
                        type="text"
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        placeholder="New habit name..."
                        className="flex-grow text-sm border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="relative">
                        <select
                          value={newHabitXp}
                          onChange={(e) => setNewHabitXp(parseInt(e.target.value))}
                          className="text-sm border-y border-r border-gray-300 rounded-r-lg px-2 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value={5}>5 XP</option>
                          <option value={10}>10 XP</option>
                          <option value={15}>15 XP</option>
                          <option value={20}>20 XP</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-md transition"
                      disabled={newHabitName.trim() === ''}
                    >
                      Add Habit
                    </button>
                  </form>
                  
                  <div className="divide-y divide-gray-200 rounded-lg overflow-hidden border border-gray-200">
                    {habits.length > 0 ? (
                      habits.map(habit => (
                        <HabitItem 
                          key={habit.id} 
                          habit={habit} 
                          onChange={toggleHabitSelection}
                          editable={true}
                          multiplier={streakMultiplier}
                        />
                      ))
                    ) : (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        No habits added yet. Create your first habit above!
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex justify-between">
                    <button
                      onClick={submitHabits}
                      disabled={selectedHabits === 0}
                      className={`py-1.5 px-3 rounded-lg transition text-xs font-medium ${
                        selectedHabits > 0 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Enter Habits
                    </button>
                    <button
                      onClick={resetHabits}
                      className="py-1.5 px-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-xs"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Top Right: Active Streaks */}
            <div className="col-start-3 col-span-1 row-start-1 row-span-1 flex items-start justify-end">
              {/* Keep existing streaks panel content */}
              {!isPanelOpen('streaks') ? (
                <button
                  onClick={() => openPanel('streaks')}
                  className="bg-white rounded-lg shadow-md py-2 px-4 hover:bg-orange-50 transition-all duration-300 flex items-center space-x-2 border-r-4 border-orange-500"
                >
                  <span className="text-xl">🔥</span>
                  <div className="text-left">
                    <span className="font-bold text-gray-800 block">Active Streaks</span>
                    <span className="text-xs text-gray-500">{activeStreaks.length} active</span>
                  </div>
                </button>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-xs sm:max-w-sm md:max-w-md max-h-[80vh] overflow-auto z-20 border-r-4 border-orange-500">
                  {/* Existing streaks panel content */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-800 flex items-center">
                      <span className="mr-2">🔥</span>
                      <span>Active Streaks</span>
                    </h3>
                    <button 
                      onClick={() => openPanel(null)}
                      className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 011.414 0L10 8.586l4.293-4.293a1 1 111.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {activeStreaks.length > 0 ? (
                      activeStreaks.map(habit => (
                        <StreakItem key={habit.id} habit={habit} />
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 py-2">
                        No active streaks yet — complete habits two days in a row to begin!
                      </p>
                    )}
                  </div>
                  
                  {activeStreaks.length > 0 && (
                    <div className="mt-3 text-xs text-gray-600 italic">
                      Streaks boost your XP multiplier!
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Center: Avatar + XP - spans all rows */}
            <div className="col-start-2 col-span-1 row-start-1 row-span-3 flex flex-col items-center justify-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-1">Habit Hero</h1>
              <h2 className="text-lg text-gray-600 mb-4">Level {level}</h2>
              
              {/* Avatar with glow effect */}
              <div className="relative mb-10">
                <div className="absolute inset-0 scale-150 bg-orange-100 rounded-full filter blur-xl opacity-60 animate-pulse"></div>
                <img 
                  src={avatarImage} 
                  alt={`Level ${level} Avatar`}
                  style={{ width: '180px', height: '180px' }} 
                  className="relative object-cover rounded-full shadow-2xl border-4 border-white z-10 transition-all duration-700" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = "w-32 h-32 bg-gray-200 rounded-full shadow-inner flex items-center justify-center";
                    fallback.innerHTML = '<span class="text-gray-400 text-6xl">👤</span>';
                    e.target.parentNode.appendChild(fallback);
                  }}
                />
                
                {/* Level indicator badge */}
                <div className="absolute -bottom-3 right-5 bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold border-2 border-white shadow-lg z-20">
                  {level}
                </div>
              </div>
              
              {/* XP Display */}
              <div className="w-full bg-black bg-opacity-10 backdrop-filter backdrop-blur-sm py-4 px-5 rounded-xl shadow-md">
                {/* Existing XP content */}
                <div className="flex justify-between items-center mb-2 flex-wrap gap-y-2">
                  <div className="flex items-center">
                    <p className="text-gray-800 font-medium text-lg">
                      XP: 
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={xp}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20, position: 'absolute' }}
                          className="inline-block ml-1 mr-1"
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                          {xp}
                        </motion.span>
                      </AnimatePresence>
                      / {maxXp}
                    </p>
                    {streakMultiplier > 1 && (
                      <motion.div 
                        className="ml-3 text-base text-orange-500 font-bold flex items-center" 
                        title="Streak Bonus Active!"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <motion.span 
                          className="mr-1"
                          animate={{ rotate: [-5, 5, -5] }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
                        >
                          🔥
                        </motion.span>
                        <span>x{streakMultiplier.toFixed(1)}</span>
                      </motion.div>
                    )}
                  </div>
                  {previewXp > 0 && (
                    <motion.p 
                      className="text-base text-green-600 font-medium"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      key={previewXp}
                    >
                      +{previewXp} XP
                    </motion.p>
                  )}
                </div>
                <div className="w-full max-w-sm mx-auto mt-2">
                  <XPBar xp={xp} maxXp={maxXp} previewXp={previewXp} />
                </div>
              </div>
            </div>
            
            {/* Bottom Left: Personal Records */}
            <div className="col-start-1 col-span-1 row-start-3 row-span-1 flex items-end justify-start">
              {/* Keep existing records panel content */}
              {!isPanelOpen('records') ? (
                <button
                  onClick={() => openPanel('records')}
                  className="bg-white rounded-lg shadow-md py-2 px-4 hover:bg-purple-50 transition-all duration-300 flex items-center space-x-2 border-l-4 border-purple-500"
                >
                  <span className="text-xl">🏆</span>
                  <div className="text-left">
                    <span className="font-bold text-gray-800 block">Personal Records</span>
                    <span className="text-xs text-gray-500">Level {level} achieved</span>
                  </div>
                </button>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-xs sm:max-w-sm md:max-w-md max-h-[80vh] overflow-auto z-20 border-l-4 border-purple-500 origin-bottom-left">
                  {/* Existing records panel content */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-800 flex items-center">
                      <span className="mr-2">🏆</span>
                      <span>Personal Records</span>
                    </h3>
                    <button 
                      onClick={() => openPanel(null)}
                      className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 011.414 0L10 8.586l4.293-4.293a1 1 111.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Add new PR form */}
                  <form onSubmit={addPersonalRecord} className="mb-3">
                    <div className="mb-2">
                      <input
                        type="text"
                        value={newPrName}
                        onChange={(e) => setNewPrName(e.target.value)}
                        placeholder="New record name..."
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 mb-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <div className="flex space-x-1">
                        <input
                          type="number"
                          value={newPrValue}
                          onChange={(e) => setNewPrValue(e.target.value)}
                          placeholder="Starting value..."
                          className="flex-grow text-sm border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          min="0"
                        />
                        <select
                          value={newPrUnit}
                          onChange={(e) => setNewPrUnit(e.target.value)}
                          className="text-sm border-y border-r border-gray-300 rounded-r-lg px-2 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="reps">reps</option>
                          <option value="seconds">seconds</option>
                          <option value="minutes">minutes</option>
                          <option value="kg">kg</option>
                          <option value="lbs">lbs</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium rounded-md transition"
                      disabled={newPrName.trim() === '' || newPrValue === '' || isNaN(newPrValue) || newPrValue < 0}
                    >
                      Add Record
                    </button>
                  </form>
                  
                  {/* Update the personal records display */}
                  <div className="space-y-2">
                    {personalRecords.length > 0 ? (
                      personalRecords.map(record => (
                        <div key={record.id} className="bg-purple-50 rounded-lg p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-700 truncate max-w-[150px]">{record.name}:</span>
                            <span className="text-sm font-medium text-purple-700">
                              {record.current} {record.unit}
                            </span>
                          </div>
                          <div className="flex space-x-1 justify-end">
                            <button 
                              onClick={() => tiePR(record.id)}
                              className="py-1 px-2 text-xs bg-purple-200 text-purple-700 rounded hover:bg-purple-300 transition"
                              title="Award 25 XP for tying your record"
                            >
                              Tie (+25)
                            </button>
                            <button 
                              onClick={() => beatPR(record.id)}
                              className="py-1 px-2 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                              title="Award 50 XP and update your record"
                            >
                              Beat (+50)
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-gray-500 text-center">
                        No records added yet. Create your first record above!
                      </div>
                    )}
                  
                    {/* Stats section */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Highest level:</span>
                        <span className="text-sm font-medium text-purple-700">{level}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-700">Total XP earned:</span>
                        <span className="text-sm font-medium text-purple-700">
                          {(level - 1) * 100 + xp} XP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Bottom Right: To-Dos */}
            <div className="col-start-3 col-span-1 row-start-3 row-span-1 flex items-end justify-end">
              {/* Keep existing todos panel content */}
              {!isPanelOpen('todos') ? (
                <button
                  onClick={() => openPanel('todos')}
                  className="bg-white rounded-lg shadow-md py-2 px-4 hover:bg-green-50 transition-all duration-300 flex items-center space-x-2 border-r-4 border-green-500"
                >
                  <span className="text-xl">📋</span>
                  <div className="text-left">
                    <span className="font-bold text-gray-800 block">To-Dos</span>
                    <span className="text-xs text-gray-500">Quick tasks</span>
                  </div>
                </button>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-xs sm:max-w-sm md:max-w-md max-h-[80vh] overflow-auto z-20 border-r-4 border-green-500 origin-bottom-right">
                  {/* Existing todos panel content */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-800 flex items-center">
                      <span className="mr-2">📋</span>
                      <span>To-Dos</span>
                    </h3>
                    <button 
                      onClick={() => openPanel(null)}
                      className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 011.414 0L10 8.586l4.293-4.293a1 1 111.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Add new todo form */}
                  <form onSubmit={addTodo} className="mb-3">
                    <div className="flex">
                      <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="New to-do..."
                        className="flex-grow text-sm border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                      <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 rounded-r-lg transition"
                        disabled={newTodo.trim() === ''}
                      >
                        Add
                      </button>
                    </div>
                  </form>
                  
                  <div className="space-y-2">
                    {todos.length > 0 ? (
                      todos.map(todo => (
                        <div key={todo.id} className="flex items-center p-2 border-b border-gray-100">
                          <input 
                            type="checkbox" 
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                            className="mr-3 w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500" 
                          />
                          <span className={`text-sm ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {todo.text}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-gray-500 text-center">
                        No to-dos added yet. Add your first task above!
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500 italic">
                    To-dos award +5 XP when completed
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Keep animations and modals outside the grid */}
          {/* XP gain animation */}
          {xpGainAnimation.show && (
            <motion.div 
              className="fixed bottom-10 right-10 bg-green-500 text-white font-bold rounded-full px-4 py-2 z-50 text-2xl shadow-lg"
              initial={{ y: 50, opacity: 0, scale: 0.5 }}
              animate={{ y: -50, opacity: 1, scale: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              +{xpGainAnimation.amount} XP!
            </motion.div>
          )}
          
          {/* Level up modal */}
          {showLevelUp && (
            <motion.div 
              className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 p-8 rounded-xl shadow-2xl text-center"
                initial={{ scale: 0.5, y: 100, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.5, y: -100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div 
                  className="text-6xl mb-4"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ duration: 0.6, repeat: 2 }}
                >
                  🎉
                </motion.div>
                <motion.h2 
                  className="text-3xl font-bold text-gray-800 mb-2"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3, repeatType: "mirror" }}
                >
                  Level Up!
                </motion.h2>
                <p className="text-xl text-gray-700">You've reached level {level}!</p>
                <motion.button
                  className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLevelUp(false)}
                >
                  Continue
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </div>
      } />
    </Routes>

  );
}

export default App;
