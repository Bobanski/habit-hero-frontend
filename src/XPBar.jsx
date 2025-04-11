import React from 'react';

const XPBar = ({ xp, maxXp }) => {
  const percentage = Math.min((xp / maxXp) * 100, 100);

  return (
    <div className="w-full bg-gray-300 rounded-full h-5 sm:h-6 overflow-hidden mx-auto">
      <div
        className="bg-green-500 h-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default XPBar;
