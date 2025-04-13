import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage personal records state and related actions.
 *
 * @param {Array} initialRecords - The initial array of personal records from loaded user data.
 * @returns {object} An object containing records state, functions to modify records,
 *                   and state for the new record form.
 */
export function useRecords(initialRecords = []) {
  const [personalRecords, setPersonalRecords] = useState(initialRecords);
  const [newPrName, setNewPrName] = useState('');
  const [newPrValue, setNewPrValue] = useState('');
  const [newPrUnit, setNewPrUnit] = useState('reps'); // Default unit type

  // Update state if initial values change (e.g., after data load)
  // useEffect(() => {
  //   setPersonalRecords(initialRecords);
  // }, [initialRecords]); // Commented out: This might cause infinite loops if initialRecords reference changes often. Initial state is set via useState.

  // Function to add a new personal record
  const addPersonalRecord = useCallback((e) => {
    if (e) e.preventDefault();
    const trimmedName = newPrName.trim();
    const parsedValue = parseInt(newPrValue, 10);

    if (trimmedName === '' || isNaN(parsedValue) || parsedValue < 0) {
      console.warn("Invalid PR input"); // Or set an error state for UI feedback
      return;
    }

    const newRecord = {
      id: Date.now(),
      name: trimmedName,
      current: parsedValue,
      unit: newPrUnit
    };

    setPersonalRecords(currentRecords => [...currentRecords, newRecord]);
    setNewPrName(''); // Reset form
    setNewPrValue('');
    // Note: Saving the updated list should happen after this via saveUserData
  }, [newPrName, newPrValue, newPrUnit]);

  // Function to handle tying a PR
  // Returns the XP amount to be awarded by the calling component.
  const tiePR = useCallback((recordId) => {
    // Logic to potentially update record state if needed (e.g., lastTiedDate)
    // Currently, just returns the XP value.
    const xpGained = 25; // XP for tying a PR
    console.log(`Tied PR ${recordId}, returning ${xpGained} XP`);
    return xpGained;
    // Note: The calling component should handle calling gainXP and triggering animation.
  }, []);

  // Function to handle beating a PR
  // Updates the record locally and returns the XP amount to be awarded.
  const beatPR = useCallback((recordId) => {
    const record = personalRecords.find(r => r.id === recordId);
    if (!record) return null; // Return null if record not found

    const newValueStr = prompt(`You beat your ${record.name} PR of ${record.current} ${record.unit}! Enter your new record:`);
    if (!newValueStr) return null; // User cancelled prompt

    const newValue = parseInt(newValueStr, 10);
    if (isNaN(newValue) || newValue <= record.current) {
      alert("Please enter a valid number higher than your current record.");
      return null; // Invalid input, return null
    }

    // Update the record in the local state
    setPersonalRecords(currentRecords =>
      currentRecords.map(r =>
        r.id === recordId ? { ...r, current: newValue } : r
      )
    );

    const xpGained = 50; // XP for beating a PR
    console.log(`Beat PR ${recordId} with ${newValue}, returning ${xpGained} XP`);
    // Note: Saving the updated list and calling gainXP should happen in the calling component.
    return xpGained;
  }, [personalRecords]); // Dependency on personalRecords to find the correct record

  return {
    personalRecords,
    setPersonalRecords, // Expose setter for direct updates if needed
    newPrName,
    setNewPrName,
    newPrValue,
    setNewPrValue,
    newPrUnit,
    setNewPrUnit,
    addPersonalRecord,
    tiePR,
    beatPR
  };
}