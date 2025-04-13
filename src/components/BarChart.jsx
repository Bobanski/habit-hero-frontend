// src/components/BarChart.jsx
import React from "react";

// Define a color palette
const defaultColors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
  'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
];
const textColors = [
  'text-blue-700', 'text-green-700', 'text-purple-700', 'text-red-700',
  'text-yellow-700', 'text-indigo-700', 'text-pink-700', 'text-teal-700'
];


const BarChart = ({ data, title, colors = defaultColors, height = 200 }) => {
  // Calculate actual max value, default to 0 if data is empty
  const actualMaxValue = Math.max(0, ...data.map((d) => d.value || 0));
  // Add padding (e.g., 15%) to the max value for visual buffer, ensure it's at least 1
  const chartMaxValue = actualMaxValue > 0 ? actualMaxValue * 1.15 : 1;

  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      {/* Container for bars */}
      <div className="relative flex items-end h-[200px] space-x-2 border-b border-gray-200">
        {/* Remove 50% Gridline */}
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              // Assign color based on index, cycling through the palette
              className={`w-full rounded-t-md ${colors[index % colors.length]} border border-gray-300 transition-all duration-500 ease-out`}
              style={{
                // Ensure height calculation is correct and non-negative
                height: `${Math.max(0, ((item.value || 0) / chartMaxValue) * height)}px`,
                minHeight: "1px",
              }}
            >
              {/* Value label inside the bar */}
              {(item.value || 0) > 0 && ( // Only show label if value > 0
                 <span className="absolute bottom-1 left-0 right-0 text-center text-white text-xs font-bold pointer-events-none">
                   {item.value || 0}
                 </span>
              )}
            </div>
            {/* Larger, Bolder Axis Label */}
            <span className={`text-sm mt-1 font-bold ${textColors[index % textColors.length]}`}>
              {item.label || ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
