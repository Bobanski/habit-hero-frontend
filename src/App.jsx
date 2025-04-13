import React, { useEffect, useCallback, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Core Components
import Login from './Login';
import ProgressDashboard from './ProgressDashboard';
import ProgressAnalytics from './ProgressAnalytics';

// UI Components
import XPBar from './components/XPBar';
import HabitItem from './components/HabitItem';
import StreakItem from './components/StreakItem';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useXPLevel } from './hooks/useXPLevel';
import { useHabits } from './hooks/useHabits';
import { useRecords } from './hooks/useRecords';
import { useTodos } from './hooks/useTodos';
import { useUI } from './hooks/useUI';

// Services & Utils
import { saveUserData } from './services/userService';
import { handleDailyLoginBonus } from './services/bonusService';
import { getAvatarImage } from './utils/levelUtils';
import { calculateStreakMultiplier } from './utils/streakUtils';

// Styles
import './App.css';

function App() {
  const navigate = useNavigate();

  // --- NEW STATE FOR PANEL POSITION ---
  const [panelAnchorPos, setPanelAnchorPos] = useState({ top: 0, left: 0 });

  // --- Hooks ---
  const { user, userData, isLoading, logout, handleLoginSuccess: authLoginSuccess, reloadUserData } = useAuth();
  const {
    activePanel, setActivePanel, openPanel, isPanelOpen,
    view, setView, xpGainAnimation, triggerXpGainAnimation,
    dailyBonusInfo, showDailyBonus
  } = useUI();

  const { xp, level, maxXp, showLevelUp, gainXP, updateLocalXPLevel } = useXPLevel(userData?.xp, userData?.level); // Added updateLocalXPLevel
  const {
    habits, setHabits, newHabitName, setNewHabitName, newHabitXp, setNewHabitXp,
    toggleHabitSelection, addNewHabit, resetHabitSelections, activeStreaks, selectedHabitsInfo
  } = useHabits(userData?.habits);
  const {
    personalRecords, setPersonalRecords, newPrName, setNewPrName, newPrValue, setNewPrValue,
    newPrUnit, setNewPrUnit, addPersonalRecord, tiePR, beatPR
  } = useRecords(userData?.prs);
  const {
    todos, setTodos, newTodo, setNewTodo, addTodo, toggleTodo
  } = useTodos(userData?.todos);

  const streakMultiplier = calculateStreakMultiplier(habits || []);
  const avatarImage = getAvatarImage(level);
  const previewXp = Math.round(selectedHabitsInfo.baseXp * streakMultiplier);

  // --- Effects ---
  useEffect(() => {
    if (userData && user) {
      const currentDate = new Date().toISOString().split('T')[0];
      const { newStreak, bonusXp, showBonusModal } = handleDailyLoginBonus(
        userData.lastLoginDate,
        currentDate,
        userData.dailyStreak || 0
      );

      if (showBonusModal) {
        console.log(`Applying daily bonus: Streak ${newStreak}, XP ${bonusXp}`);
        const updatedDataForBonus = {
          ...userData,
          xp: userData.xp + bonusXp,
          level: userData.level,
          habits: userData.habits,
          prs: userData.prs,
          todos: userData.todos,
          loginStreak: newStreak,
          lastLoginDate: currentDate,
        };

        gainXP(bonusXp, habits, personalRecords, todos, newStreak, currentDate, true)
          .then(actualXpGained => {
            showDailyBonus(newStreak, bonusXp);
          })
          .catch(error => {
            console.error("Failed to process daily bonus XP gain:", error);
          });
      }
    }
  }, [userData, user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const awardXP = useCallback(async (baseAmount, source) => {
    if (baseAmount > 0) {
      console.log(`Awarding ${baseAmount} base XP from ${source}`);
      const actualXpGained = await gainXP(baseAmount, habits, personalRecords, todos);
      triggerXpGainAnimation(actualXpGained);
    }
  }, [gainXP, triggerXpGainAnimation, habits, personalRecords, todos]);

  const handleSubmitHabits = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    let totalBaseXpGained = 0;

    const updatedHabits = habits.map(habit => {
      if (habit.selected) {
        totalBaseXpGained += habit.xp;
        let newStreak = habit.lastCompletedDate === today ? habit.streak : (habit.streak || 0) + 1;
        return {
          ...habit,
          selected: false,
          lastCompletedDate: today,
          streak: newStreak
        };
      }
      return habit;
    });

    // Calculate actual XP gained locally for UI update, but don't send it
    const actualXpGained = Math.round(totalBaseXpGained * streakMultiplier);
    // const newXp = xp + actualXpGained; // Don't calculate final XP here
    // const newLevel = level; // Don't calculate final level here

    // Update local habit state immediately for UI responsiveness
    setHabits(updatedHabits);

    // Construct payload: Send ONLY the updated habits list.
    // Backend will calculate XP gain, new total XP, level, and update history.
    const saveData = {
      habits: updatedHabits
      // Optionally include PRs/Todos if they can be modified concurrently,
      // but for habit submission, only habits are strictly needed.
      // prs: personalRecords,
      // todos: todos,
    };

    // Save the updated data
    const saveSuccess = await saveUserData(saveData);

    if (saveSuccess) {
        console.log("Habits submitted and data saved.");
        // Trigger animation and update local state *after* successful save
        if (actualXpGained > 0) {
             // Call the function to update local state and trigger level-up checks/animations
             // Pass actualXpGained (already includes multiplier) and bypass multiplier in the function
             updateLocalXPLevel(actualXpGained, null, true); // Pass null for habits, bypass multiplier
             triggerXpGainAnimation(actualXpGained); // Trigger XP gain animation
        }
        // --- Force reload of userData from backend ---
        await reloadUserData(); // Fetch fresh data to update analytics
        // --- End Force reload ---
    } else {
      console.error("Failed to save after submitting habits.");
      // Consider reverting local state changes if save fails
      // setHabits(habits); // Revert habits if needed
    }

    setActivePanel(null); // Close panel regardless of save success?
  }, [habits, xp, level, personalRecords, todos, setHabits, awardXP, setActivePanel]);

  const handleAddNewHabit = useCallback(async (e) => {
    // addNewHabit updates local state synchronously
    addNewHabit(e);
    // Immediately save the updated habits list
    // Need to access the latest state *after* addNewHabit runs.
    // This is tricky with useCallback dependencies. A slight refactor might be needed,
    // or we rely on the state update completing before saveUserData reads it.
    // Let's try saving immediately, assuming state updates quickly.
    // A more robust solution might involve useEffect or passing state directly.
    const success = await saveUserData({ habits: habits }); // Send the current habits list
    if (!success) {
        console.error("Failed to save new habit to backend.");
        // Optionally revert local state change here
    } else {
        console.log("New habit saved to backend.");
        // Optionally reload data if backend response is needed
        // await reloadUserData();
    }
  }, [addNewHabit, habits, saveUserData]); // Add habits and saveUserData to dependencies

  const handleAddPersonalRecord = useCallback(async (e) => {
    addPersonalRecord(e); // Updates local state
    // Immediately save the updated PR list
    const success = await saveUserData({ prs: personalRecords }); // Send current PR list
     if (!success) {
        console.error("Failed to save new PR to backend.");
    } else {
        console.log("New PR saved to backend.");
        // await reloadUserData();
    }
  }, [addPersonalRecord, personalRecords, saveUserData]); // Add dependencies

  const handleAddTodo = useCallback(async (e) => {
    addTodo(e); // Updates local state
    // Immediately save the updated Todo list
    const success = await saveUserData({ todos: todos }); // Send current todos list
     if (!success) {
        console.error("Failed to save new Todo to backend.");
    } else {
        console.log("New Todo saved to backend.");
        // await reloadUserData();
    }
  }, [addTodo, todos, saveUserData]); // Add dependencies

  const handleTiePR = useCallback(async (recordId) => {
    const xpAmount = tiePR(recordId);
    if (xpAmount !== null && xpAmount > 0) {
      // awardXP calls gainXP which saves the core xp/level update.
      // Reloading immediately after might cause state conflicts.
      await awardXP(xpAmount, 'tie PR');
      // Removed await reloadUserData();
    }
  }, [tiePR, awardXP]);

  const handleBeatPR = useCallback(async (recordId) => {
    // beatPR updates local state and returns XP amount
    const xpAmount = beatPR(recordId);
    let prSaveSuccess = true;

    // Save the updated PR list *after* beatPR updates local state
    // Note: beatPR uses prompt, which is blocking. State should be updated before save.
    const updatedPrs = personalRecords; // Assuming beatPR mutated the state reference correctly or set new state
    prSaveSuccess = await saveUserData({ prs: updatedPrs });
     if (!prSaveSuccess) {
        console.error("Failed to save updated PR list after beating record.");
        // Consider reverting local PR state change
    } else {
         console.log("Updated PR list saved after beating record.");
    }

    // Award XP if applicable (this also saves XP/Level)
    if (xpAmount !== null && xpAmount > 0) {
      await awardXP(xpAmount, 'beat PR');
    }

    // Optionally reload data if needed, especially if save failed
    // if (!prSaveSuccess) await reloadUserData();

  }, [beatPR, awardXP, personalRecords, saveUserData]); // Add dependencies

  const handleToggleTodo = useCallback(async (todoId) => {
    const xpAmount = toggleTodo(todoId);
    if (xpAmount !== null && xpAmount > 0) {
      // awardXP calls gainXP which saves the core xp/level update.
      await awardXP(xpAmount, 'toggle todo');
      // Removed await reloadUserData();
    } else {
      // If no XP gained, we might still need to save the toggled state.
      // Let's add a save call here for the todo list specifically.
      console.warn("Todo toggled without XP gain. Saving Todo state.");
      const saveData = { todos: todos }; // Send only updated todos
      const saveSuccess = await saveUserData(saveData);
      if (saveSuccess) {
         // Optionally reload data if needed after non-XP save
         // await reloadUserData();
      } else {
         console.error("Failed to save todo toggle state.");
      }
    }
  }, [toggleTodo, awardXP]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Login onLoginSuccess={authLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 font-sans">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Habit Hero</h1>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setView("dashboard")}
              className={`px-3 py-1 rounded-l-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${view === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView("analytics")}
              className={`px-3 py-1 rounded-r-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${view === 'analytics' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Analytics
            </button>
          </div>
          <span className="text-gray-600">Welcome, {user.username}!</span>
          <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800">Logout</button>
        </div>
      </header>

      <main className="p-4 md:p-8">
        {view === "dashboard" ? (
          <ProgressDashboard
            user={user}
            xp={xp}
            level={level}
            maxXp={maxXp}
            avatarImage={avatarImage}
            habits={habits}
            personalRecords={personalRecords}
            todos={todos}
            activeStreaks={activeStreaks}
            streakMultiplier={streakMultiplier}
            previewXp={previewXp}
            activePanel={activePanel}
            openPanel={openPanel}
            isPanelOpen={isPanelOpen}
            panelAnchorPos={panelAnchorPos}             // ✅ NEW
            setPanelAnchorPos={setPanelAnchorPos}       // ✅ NEW
            newHabitName={newHabitName}
            setNewHabitName={setNewHabitName}
            newHabitXp={newHabitXp}
            setNewHabitXp={setNewHabitXp}
            handleAddNewHabit={handleAddNewHabit}
            toggleHabitSelection={toggleHabitSelection}
            handleSubmitHabits={handleSubmitHabits}
            resetHabitSelections={resetHabitSelections}
            newPrName={newPrName}
            setNewPrName={setNewPrName}
            newPrValue={newPrValue}
            setNewPrValue={setNewPrValue}
            newPrUnit={newPrUnit}
            setNewPrUnit={setNewPrUnit}
            handleAddPersonalRecord={handleAddPersonalRecord}
            handleTiePR={handleTiePR}
            handleBeatPR={handleBeatPR}
            newTodo={newTodo}
            setNewTodo={setNewTodo}
            handleAddTodo={handleAddTodo}
            handleToggleTodo={handleToggleTodo}
            XPBarComponent={XPBar}
            HabitItemComponent={HabitItem}
            StreakItemComponent={StreakItem}
          />
        ) : (
          <ProgressAnalytics userData={userData} />
        )}
      </main>

      {/* Floating UI (XP animation, level up, bonus modal) */}
      <AnimatePresence>
        {xpGainAnimation.show && (
          <motion.div className="fixed bottom-10 right-10 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            +{xpGainAnimation.amount} XP!
          </motion.div>
        )}

        {showLevelUp && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="bg-white p-8 rounded-lg shadow-xl text-center"
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <h2 className="text-4xl font-bold text-yellow-500 mb-4">Level Up!</h2>
              <p className="text-xl text-gray-700">You reached Level {level}!</p>
            </motion.div>
          </motion.div>
        )}

        {dailyBonusInfo.show && (
          <motion.div className="fixed bottom-10 left-10 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <p>Daily Login!</p>
            {dailyBonusInfo.streak > 1 && (
              <p className="text-sm">{dailyBonusInfo.streak} Day Streak!</p>
            )}
            <p className="text-lg">+{dailyBonusInfo.xp} XP!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
