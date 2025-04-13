import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage To-Do list state and related actions.
 *
 * @param {Array} initialTodos - The initial array of todos from loaded user data.
 * @returns {object} An object containing todos state, functions to modify todos,
 *                   and state for the new todo form.
 */
export function useTodos(initialTodos = []) {
  const [todos, setTodos] = useState(initialTodos);
  const [newTodo, setNewTodo] = useState('');

  // Update state if initial values change (e.g., after data load)
  // useEffect(() => {
  //   setTodos(initialTodos);
  // }, [initialTodos]); // Commented out: This might cause infinite loops if initialTodos reference changes often. Initial state is set via useState.

  // Function to add a new To-Do
  const addTodo = useCallback((e) => {
    if (e) e.preventDefault();
    const trimmedText = newTodo.trim();
    if (trimmedText === '') return;

    const newItem = {
      id: Date.now(),
      text: trimmedText,
      completed: false
    };

    setTodos(currentTodos => [...currentTodos, newItem]);
    setNewTodo(''); // Reset form
    // Note: Saving the updated list should happen after this via saveUserData
  }, [newTodo]);

  // Function to toggle a To-Do completion status
  // Returns the XP amount to award if the todo is marked complete.
  const toggleTodo = useCallback((todoId) => {
    let xpGained = 0;
    let toggledTodo = null;

    setTodos(currentTodos =>
      currentTodos.map(todo => {
        if (todo.id === todoId) {
          // Check if we are marking it as complete (was previously incomplete)
          if (!todo.completed) {
            xpGained = 5; // Award 5 XP for completing a todo
            console.log(`Todo ${todoId} completed, returning ${xpGained} XP`);
          }
          toggledTodo = { ...todo, completed: !todo.completed };
          return toggledTodo;
        }
        return todo;
      })
    );

    // Note: Saving the updated list and calling gainXP should happen in the calling component.
    return xpGained; // Return 5 if completed, 0 otherwise
  }, []); // No dependencies needed as it operates on the current state via the setter function

  return {
    todos,
    setTodos, // Expose setter for direct updates if needed
    newTodo,
    setNewTodo,
    addTodo,
    toggleTodo
  };
}