import React from 'react';

const XPBar = ({ xp, maxXp }) => {
  const percentage = Math.min((xp / maxXp) * 100, 100);

  return (
    <div className="w-[85%] bg-gray-300 rounded-xl h-6 overflow-hidden mx-auto mt-16">
      <div
        className="bg-green-500 h-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default XPBar;
