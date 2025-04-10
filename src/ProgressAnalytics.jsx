import { motion } from 'framer-motion';
import { useState } from 'react';

// Simple Bar Chart Component
const BarChart = ({ data, title, color, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <div className="flex items-end h-[200px] space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <motion.div 
              className={`w-full rounded-t-md ${color}`}
              style={{ 
                height: `${(item.value / maxValue) * height}px`,
              }}
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / maxValue) * height}px` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
            <div className="text-xs mt-1 text-gray-600">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple Line Chart Component
const LineChart = ({ data, title, color, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const points = data.map((item, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - (item.value / maxValue) * 100
  }));
  
  // Generate SVG path
  const pathData = points.reduce((path, point, i) => {
    return path + `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
  }, '');
  
  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <div className="relative h-[200px] w-full">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path
            d={pathData}
            fill="none"
            stroke={color === 'bg-blue-500' ? '#3b82f6' : 
                   color === 'bg-green-500' ? '#22c55e' : 
                   color === 'bg-purple-500' ? '#a855f7' : '#6b7280'}
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          {/* Dots at each data point */}
          {points.map((point, index) => (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="2"
              fill={color === 'bg-blue-500' ? '#3b82f6' : 
                   color === 'bg-green-500' ? '#22c55e' : 
                   color === 'bg-purple-500' ? '#a855f7' : '#6b7280'}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
            />
          ))}
        </svg>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between">
          {data.map((item, index) => (
            <div key={index} className="text-xs text-gray-500">{item.label}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Progress Record Component
const ProgressRecord = ({ name, previousValue, currentValue, unit, improvement }) => {
  const percentage = previousValue > 0 ? (currentValue / previousValue) * 100 - 100 : 100;
  
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm mb-3">
      <div className="flex justify-between mb-1">
        <span className="font-medium text-gray-700">{name}</span>
        <span className="text-sm text-gray-500">
          {previousValue} → <span className="font-bold text-purple-700">{currentValue}</span> {unit}
        </span>
      </div>
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percentage)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="mt-1 text-xs flex justify-end">
        <span className={`${improvement > 0 ? 'text-green-600' : 'text-gray-500'}`}>
          {improvement > 0 ? `+${improvement} ${unit} improvement` : 'No change'}
        </span>
      </div>
    </div>
  );
};

function ProgressAnalytics({ userData, onBack }) {
  const [activeTab, setActiveTab] = useState('xp');
  
  // Sample XP data - in a real app, this would come from user's activity history
  const xpData = [
    { label: 'Mon', value: 25 },
    { label: 'Tue', value: 40 },
    { label: 'Wed', value: 15 },
    { label: 'Thu', value: 35 },
    { label: 'Fri', value: 55 },
    { label: 'Sat', value: 20 },
    { label: 'Sun', value: 30 },
  ];
  
  // Sample streak data
  const streakData = [
    { label: 'Week 1', value: 2 },
    { label: 'Week 2', value: 3 },
    { label: 'Week 3', value: 5 },
    { label: 'Week 4', value: 4 },
    { label: 'Week 5', value: 7 },
  ];
  
  // Sample PR data
  const prData = [
    { name: "Push-ups", previousValue: 15, currentValue: 20, unit: "reps", improvement: 5 },
    { name: "Plank time", previousValue: 30, currentValue: 45, unit: "seconds", improvement: 15 },
    { name: "Running", previousValue: 2.5, currentValue: 3.0, unit: "km", improvement: 0.5 },
  ];
  
  // Monthly XP summary
  const monthlyXpData = [
    { label: 'Jan', value: 320 },
    { label: 'Feb', value: 280 },
    { label: 'Mar', value: 340 },
    { label: 'Apr', value: 390 },
  ];
  
  return (
    <motion.div 
      className="min-h-screen bg-gray-100 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Progress Analytics Dashboard</h1>
          <motion.button
            onClick={onBack}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </motion.button>
        </div>
        
        {/* User summary */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.35-.035-.691-.1-1.021A5 5 0 0010 7z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{userData?.username || 'User'}'s Progress</h2>
              <p className="text-gray-600">
                Level {userData?.level || 1} • Total XP: {((userData?.level || 1) - 1) * 100 + (userData?.xp || 0)} • 
                Active Streaks: {userData?.habits?.filter(h => h.streak >= 2)?.length || 0}
              </p>
            </div>
          </div>
        </div>
        
        {/* Tabs for different analytics */}
        <div className="flex space-x-2 mb-6">
          <button 
            onClick={() => setActiveTab('xp')} 
            className={`py-2 px-4 rounded-lg transition ${
              activeTab === 'xp' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white hover:bg-gray-100 text-gray-700'
            }`}
          >
            XP Analytics
          </button>
          <button 
            onClick={() => setActiveTab('streaks')} 
            className={`py-2 px-4 rounded-lg transition ${
              activeTab === 'streaks' 
                ? 'bg-orange-500 text-white' 
                : 'bg-white hover:bg-gray-100 text-gray-700'
            }`}
          >
            Streaks
          </button>
          <button 
            onClick={() => setActiveTab('records')} 
            className={`py-2 px-4 rounded-lg transition ${
              activeTab === 'records' 
                ? 'bg-purple-500 text-white' 
                : 'bg-white hover:bg-gray-100 text-gray-700'
            }`}
          >
            Personal Records
          </button>
        </div>
        
        {/* Analytics Content based on active tab */}
        <div className="space-y-6">
          {activeTab === 'xp' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BarChart 
                  data={xpData} 
                  title="XP Earned (Last 7 Days)" 
                  color="bg-blue-500" 
                />
                <LineChart 
                  data={monthlyXpData} 
                  title="Monthly XP Trend" 
                  color="bg-blue-500" 
                />
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-2">XP Insights</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center text-green-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    Your highest XP day was Friday with 55 XP earned
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    You've earned 220 XP in the last 7 days
                  </li>
                  <li className="flex items-center text-orange-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    Your streak bonus increased your XP gains by 15%
                  </li>
                </ul>
              </div>
            </>
          )}
          
          {activeTab === 'streaks' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LineChart 
                  data={streakData} 
                  title="Streak Growth Over Time" 
                  color="bg-orange-500" 
                />
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-bold text-lg mb-3">Current Streak Leaders</h3>
                  <div className="space-y-3">
                    {userData?.habits?.filter(h => h.streak >= 2)?.sort((a, b) => b.streak - a.streak)?.slice(0, 5)?.map((habit, i) => (
                      <div key={i} className="flex justify-between items-center p-2 border-b last:border-0">
                        <div className="flex items-center">
                          <div className="bg-orange-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                            <span className="text-orange-500 font-bold">{i + 1}</span>
                          </div>
                          <span>{habit.name}</span>
                        </div>
                        <div className="flex items-center bg-orange-50 px-2 py-1 rounded">
                          <span className="text-orange-500 font-bold mr-1">{habit.streak}</span>
                          <span className="text-orange-500">days</span>
                        </div>
                      </div>
                    )) || (
                      <div className="text-gray-500 text-center p-4">
                        No active streaks yet. Complete habits on consecutive days to build streaks!
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-2">Streak Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-3xl font-bold text-orange-500 mb-1">
                      {userData?.habits?.reduce((max, h) => Math.max(max, h.streak), 0) || 0}
                    </div>
                    <div className="text-sm text-gray-600">Longest Current Streak</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-3xl font-bold text-blue-500 mb-1">
                      {userData?.habits?.filter(h => h.streak >= 2)?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Active Streaks</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-3xl font-bold text-green-500 mb-1">
                      {Math.min(1 + (userData?.habits?.filter(h => h.streak >= 2)?.length || 0) * 0.1, 1.5).toFixed(1)}x
                    </div>
                    <div className="text-sm text-gray-600">XP Multiplier</div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'records' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-bold text-lg mb-3">Personal Records Progress</h3>
                  {prData.map((record, i) => (
                    <ProgressRecord 
                      key={i}
                      name={record.name}
                      previousValue={record.previousValue}
                      currentValue={record.currentValue}
                      unit={record.unit}
                      improvement={record.improvement}
                    />
                  ))}
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-bold text-lg mb-3">XP Earned from Records</h3>
                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600">175</div>
                      <div className="text-sm text-gray-600">Total XP from Records</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Record Ties (25 XP each)</span>
                      <span className="font-medium">3 × 25 = 75 XP</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Record Beats (50 XP each)</span>
                      <span className="font-medium">2 × 50 = 100 XP</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-2">Records Insights</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center text-purple-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Your most improved record is Plank time (+15 seconds)
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    You're averaging a 20% improvement in records this month
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ProgressAnalytics;