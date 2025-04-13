import React from 'react';
import { motion } from 'framer-motion';

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

export default XPBar;