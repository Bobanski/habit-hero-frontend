import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default HabitItem;