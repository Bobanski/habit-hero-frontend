import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Custom hook to manage habit state and related actions.
 *
 * @param {Array} initialHabits - The initial array of habits from loaded user data.
 * @returns {object} An object containing habits state, functions to modify habits,
 *                   state for the new habit form, and derived active streaks.
 */
export function useHabits(initialHabits = []) {
  const [habits, setHabits] = useState(initialHabits);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitXp, setNewHabitXp] = useState(10); // default XP

  // Update state if initial values change (e.g., after data load)
  // useEffect(() => {
  //   // Ensure initial habits have 'selected' property, defaulting to false
  //   const processedInitialHabits = initialHabits.map(h => ({ ...h, selected: h.selected || false }));
  //   setHabits(processedInitialHabits);
  // }, [initialHabits]); // Commented out: This might cause infinite loops if initialHabits reference changes often. Initial state is set via useState.

  // Toggle selection of a habit
  const toggleHabitSelection = useCallback((habitId) => {
    setHabits(currentHabits =>
      currentHabits.map(habit =>
        habit.id === habitId ? { ...habit, selected: !habit.selected } : habit
      )
    );
    // Note: Saving happens in submitHabits or potentially on other actions
  }, []);

  // Add a new habit
  const addNewHabit = useCallback((e) => {
    if (e) e.preventDefault(); // Prevent form submission if event is passed
    if (newHabitName.trim() === '') return;

    const newHabit = {
      id: Date.now(), // Use timestamp as simple unique ID
      name: newHabitName.trim(),
      completed: false, // 'completed' might be deprecated if using lastCompletedDate/streak
      selected: false,
      xp: parseInt(newHabitXp, 10) || 10, // Ensure XP is a number
      streak: 0,
      lastCompletedDate: null
    };

    setHabits(currentHabits => [...currentHabits, newHabit]);
    setNewHabitName(''); // Reset form
    // Note: Saving the new habit list should happen after this, likely via saveUserData
  }, [newHabitName, newHabitXp]);

  // Reset selection state of all habits (e.g., for daily reset or cancel)
  const resetHabitSelections = useCallback(() => {
    setHabits(currentHabits =>
      currentHabits.map(habit => ({
        ...habit,
        selected: false
      }))
    );
  }, []);

  // Calculate active streaks (derived state)
  const activeStreaks = useMemo(() => {
    return habits.filter(habit => habit.streak >= 2);
  }, [habits]);

  // Calculate selected habits count and base XP (derived state)
  const selectedHabitsInfo = useMemo(() => {
    const selected = habits.filter(habit => habit.selected);
    const count = selected.length;
    const baseXp = selected.reduce((sum, habit) => sum + habit.xp, 0);
    return { count, baseXp };
  }, [habits]);


  return {
    habits,
    setHabits, // Expose setter for direct updates if needed (e.g., after submit)
    newHabitName,
    setNewHabitName,
    newHabitXp,
    setNewHabitXp,
    toggleHabitSelection,
    addNewHabit,
    resetHabitSelections, // Renamed from resetHabits for clarity
    activeStreaks,
    selectedHabitsInfo
  };
}