import React from 'react';
import { motion } from 'framer-motion';

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

export default StreakItem;