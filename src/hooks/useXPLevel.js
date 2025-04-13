import { useState, useEffect, useCallback, useMemo } from 'react';
import { getMaxXpForLevel } from '../utils/levelUtils';
import { saveUserData } from '../services/userService';
import { calculateStreakMultiplier } from '../utils/streakUtils';

/**
 * Custom hook to manage user XP and Level state.
 *
 * @param {number} initialXp - The initial XP value from loaded user data.
 * @param {number} initialLevel - The initial level value from loaded user data.
 * @returns {object} An object containing xp, level, maxXp, showLevelUp state, and the gainXP function.
 */
export function useXPLevel(initialXp = 0, initialLevel = 1) {
  const [xp, setXp] = useState(initialXp);
  const [level, setLevel] = useState(initialLevel);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Update state if initial values change (e.g., after data load)
  // useEffect(() => {
  //   setXp(initialXp);
  // }, [initialXp]); // Commented out: Initial state set by useState. Avoid resetting based on prop changes directly within the hook.

  // useEffect(() => {
  //   setLevel(initialLevel);
  // }, [initialLevel]); // Commented out: Initial state set by useState.

  // Calculate max XP for the current level
  const maxXp = useMemo(() => getMaxXpForLevel(level), [level]);

  // Function to update local XP/Level state and handle level ups
  const updateLocalXPLevel = useCallback((amount, currentHabits, bypassMultiplier = false) => {
    let finalAmountToAdd = amount;
    // Apply multiplier only if not bypassed and habits are provided
    if (!bypassMultiplier && currentHabits) {
      const streakMultiplier = calculateStreakMultiplier(currentHabits);
      finalAmountToAdd = Math.round(amount * streakMultiplier);
      console.log(`Applying streak multiplier: ${amount} * ${streakMultiplier.toFixed(1)} = ${finalAmountToAdd}`);
    } else {
       console.log(`Using base amount (multiplier bypassed or habits not provided): ${amount}`);
       finalAmountToAdd = amount; // Ensure it uses the raw amount if bypassed
    }

    const currentMaxXp = getMaxXpForLevel(level);
    // Use functional updates for state based on previous state
    let newLevel = level;
    let newXp = xp + finalAmountToAdd;
    let leveledUp = false;

    if (newXp >= currentMaxXp) {
      newLevel = level + 1;
      newXp = newXp - currentMaxXp;
      leveledUp = true;
    }

    // Update state
    setXp(newXp);
    setLevel(newLevel);
    if (leveledUp) {
      setShowLevelUp(true); // Trigger level up animation
    }

    console.log(`Local state updated: XP=${newXp}, Level=${newLevel}, Leveled Up=${leveledUp}`);
    return { finalAmountAdded: finalAmountToAdd, finalXp: newXp, finalLevel: newLevel };
  }, [xp, level]); // Dependencies: xp, level

  // Function to gain XP, update local state via updateLocalXPLevel, AND save data
  const gainXP = useCallback(async (
    amount,
    currentHabits, // Keep habits for multiplier calculation if needed
    loginStreak = null,
    lastLoginDate = null,
    bypassMultiplier = false
  ) => {
    // 1. Update local state and get final values
    const { finalAmountAdded, finalXp, finalLevel } = updateLocalXPLevel(
        amount,
        currentHabits,
        bypassMultiplier
    );

    // 2. Save the updated core data
    try {
      await saveUserData({
        xp: finalXp,
        level: finalLevel,
        // Only send essential updates. Backend will merge.
        ...(loginStreak !== null && { loginStreak }),
        ...(lastLoginDate !== null && { lastLoginDate })
      });
      console.log("Data saved successfully after XP gain (via gainXP)");
    } catch (error) {
      console.error("Failed to save data after XP gain (via gainXP):", error);
      // Consider reverting local state changes if save fails critically
    }

    return finalAmountAdded; // Return the actual XP added after multiplier
  }, [updateLocalXPLevel]); // Dependency: updateLocalXPLevel

  // Handle level-up animation timeout
  useEffect(() => {
    let timerId;
    if (showLevelUp) {
      timerId = setTimeout(() => {
        setShowLevelUp(false);
      }, 3000);
    }
    return () => clearTimeout(timerId);
  }, [showLevelUp]);

  return {
    xp,
    level,
    maxXp,
    showLevelUp,
    gainXP,
    updateLocalXPLevel // Export the new function
  };
}
