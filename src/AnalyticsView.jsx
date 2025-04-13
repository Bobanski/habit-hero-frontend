import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// Add missing Recharts imports
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';

// Generate sample streak data for the past 14 days
const generateStreakData = (habits) => {
  const days = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Generate all days in the current month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear, currentMonth, i);
    days.push({
      date: date.toISOString().split('T')[0],
      display: i.toString(), // Just the day number
      dayOfWeek: date.getDay() // 0 = Sunday, 1 = Monday, etc.
    });
  }
  
  // Generate data points for each habit
  return days.map(dayObj => {
    const dataPoint = {
      date: dayObj.date,
      display: dayObj.display,
      dayOfWeek: dayObj.dayOfWeek
    };
    
    // For each habit, determine if it was completed on this day
    habits.forEach(habit => {
      // Use a deterministic approach based on the habit's streak and the date
      const habitStreak = habit.streak || 0;
      const dateNum = parseInt(dayObj.date.replace(/-/g, ''));
      
      // Create a more realistic pattern - more likely to be completed if the habit has a higher streak
      const completed = habitStreak > 0 && 
        ((dateNum + habit.id) % (Math.max(1, 10 - habitStreak)) !== 0) ? 1 : 0;
        
      dataPoint[habit.name] = completed;
    });
    
    return dataPoint;
  });
};

// Update the BarChart component for better mobile display

const BarChart = ({ data, title, color, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="rounded-lg bg-white p-3 sm:p-4 shadow-md">
      <h3 className="font-bold text-base sm:text-lg mb-2">{title}</h3>
      <div className="flex items-end h-[180px] sm:h-[200px] space-x-1 sm:space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <motion.div 
              className={`w-full rounded-t-md ${color}`}
              style={{ 
                height: `${(item.value / maxValue) * (height - 20)}px`,
              }}
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / maxValue) * (height - 20)}px` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
            <div className="text-[10px] sm:text-xs mt-1 text-gray-600 truncate">{item.label}</div>
          </div>
        ))}
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

// Custom tooltip for the streak chart
const StreakTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded shadow-md border border-gray-200">
        <p className="font-medium text-sm">{`Day: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-xs">
            {`${entry.name}: ${entry.value === 1 ? 'Completed' : 'Missed'}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

// Update component signature to accept individual props from App.jsx
function ProgressDashboard({
  user, xp, level, maxXp, avatarImage, habits, personalRecords, todos,
  activeStreaks, streakMultiplier, previewXp, activePanel, openPanel, isPanelOpen,
  // Habit Props
  newHabitName, setNewHabitName, newHabitXp, setNewHabitXp, handleAddNewHabit,
  toggleHabitSelection, handleSubmitHabits, resetHabitSelections,
  // PR Props
  newPrName, setNewPrName, newPrValue, setNewPrValue, newPrUnit, setNewPrUnit,
  handleAddPersonalRecord, handleTiePR, handleBeatPR,
  // Todo Props
  newTodo, setNewTodo, handleAddTodo, handleToggleTodo,
  // Components
  XPBarComponent, HabitItemComponent, StreakItemComponent
}) {
  const [activeTab, setActiveTab] = useState('xp'); // Default analytics tab
  const navigate = useNavigate();

  // Use the passed props directly (with defaults/safety checks if needed)
  const username = user?.username || 'User';
  const prs = personalRecords || []; // Use personalRecords prop

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
  
  // Generate streak data with our helper function (with error handling)
  const streakData = habits && habits.length ? generateStreakData(habits) : []; // Use habits prop
  
  // Sample PR data
  const prData = prs.map(record => ({
    name: record.name,
    previousValue: Math.max(0, record.current - Math.floor(Math.random() * 10)), // Simulating previous value
    currentValue: record.current,
    unit: record.unit,
    improvement: Math.floor(Math.random() * 10)
  })) || [];
  
  // Monthly XP summary
  const monthlyXpData = [
    { label: 'Jan', value: 320 },
    { label: 'Feb', value: 280 },
    { label: 'Mar', value: 340 },
    { label: 'Apr', value: 390 },
  ];
  
  // Colors for streak lines
  const habitColors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ec4899', // pink
    '#6366f1', // indigo
    '#14b8a6'  // teal
  ];

  // Calculate streak stats
  // activeStreaks and streakMultiplier are passed as props, no need to recalculate here
  const longestStreak = activeStreaks?.reduce((max, habit) => Math.max(max, habit.streak || 0), 0) || 0;
  
  return (
    <motion.div 
      className="min-h-screen bg-gray-100 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header with back button - Mobile Responsive */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Progress Dashboard</h1>
          <motion.button
            onClick={() => navigate('/')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 sm:py-2 sm:px-4 rounded-lg flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="hidden xs:inline">Back</span>
          </motion.button>
        </div>
        
        {/* User summary - Mobile Responsive */}
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex items-center mb-2 sm:mb-0 sm:space-x-4">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.35-.035-.691-.1-1.021A5 5 0 0010 7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{username}'s Progress</h2> {/* Use username prop */}
                <p className="text-xs sm:text-sm text-gray-600">
                  Level {level} • Total XP: {(level - 1) * 100 + xp} {/* Use level & xp props */}
                  <span className="hidden xs:inline"> • Active Streaks: {activeStreaks?.length || 0}</span> {/* Use activeStreaks prop */}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs for different analytics - Mobile Friendly */}
        <div className="mb-6">
          {/* Desktop Tabs */}
          <div className="hidden sm:flex space-x-2">
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
          
          {/* Mobile Tabs - Full width */}
          <div className="grid grid-cols-3 gap-1 sm:hidden">
            <button 
              onClick={() => setActiveTab('xp')} 
              className={`py-2 px-1 rounded-lg transition text-center text-xs ${
                activeTab === 'xp' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto mb-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              XP
            </button>
            <button 
              onClick={() => setActiveTab('streaks')} 
              className={`py-2 px-1 rounded-lg transition text-center text-xs ${
                activeTab === 'streaks' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white text-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto mb-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03z" />
              </svg>
              Streaks
            </button>
            <button 
              onClick={() => setActiveTab('records')} 
              className={`py-2 px-1 rounded-lg transition text-center text-xs ${
                activeTab === 'records' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white text-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto mb-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Records
            </button>
          </div>
        </div>
        
        {/* Analytics Content based on active tab */}
        <div className="space-y-6">
          {activeTab === 'xp' && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <BarChart 
                  data={xpData} 
                  title="XP Earned (Last 7 Days)" 
                  color="bg-blue-500" 
                />
                <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
                  <h3 className="font-bold text-base sm:text-lg mb-2">Monthly XP Trend</h3>
                  <div className="h-[180px] sm:h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyXpData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                          dot={{ r: 3 }} 
                          activeDot={{ r: 5, stroke: '#1e40af', strokeWidth: 2 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-2">XP Insights</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center text-green-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414 14.586 7H12z" clipRule="evenodd" />
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
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
                <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3">Habit Completion Calendar</h3>
                <div className="overflow-x-auto -mx-3 sm:mx-0 pb-2">
                  <div className="min-w-[600px] sm:min-w-0 border border-gray-200 rounded-lg">
                    {/* Month header */}
                    <div className="bg-gray-50 p-2 border-b border-gray-200 text-center font-medium text-sm">
                      {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                    
                    {/* Days of week header */}
                    <div className="grid grid-cols-7 border-b border-gray-200">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                        <div key={`dow-${i}`} className="text-[10px] sm:text-xs text-center py-1 text-gray-500">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar grid - the rest remains the same */}
                    {/* Empty cells for days before the 1st of the month */}
                    {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square p-1 border-r border-b border-gray-200" />
                    ))}
                    
                    {/* Actual days of the month */}
                    {streakData.map((day, dayIndex) => (
                      <div 
                        key={`day-${dayIndex}`} 
                        className="aspect-square p-1 border-r border-b border-gray-200 last:border-r-0"
                      >
                        <div className="text-xs text-gray-500 mb-1 text-center">
                          {day.display}
                        </div>
                        <div className="flex flex-col gap-1">
                          {habits.map((habit, habitIndex) => {
                            const isCompleted = day[habit.name] === 1;
                            const bgColor = isCompleted 
                              ? habitColors[habitIndex % habitColors.length] 
                              : '';
                            
                            return (
                              <div
                                key={`cell-${habit.id}-${dayIndex}`}
                                className={`w-full aspect-square rounded-sm ${bgColor ? '' : 'border border-gray-200'}`}
                                style={{ 
                                  backgroundColor: bgColor || '#f3f4f6',
                                  height: `${Math.max(8, 50 / (habits.length || 1))}px`,
                                  minHeight: '8px'
                                }}
                                title={`${habit.name}: ${isCompleted ? 'Completed' : 'Not Completed'}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Habit Legend */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {habits.map((habit, index) => (
                    <div key={`legend-${habit.id}`} className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-sm mr-2" 
                        style={{ backgroundColor: habitColors[index % habitColors.length] }} 
                      />
                      <span className="text-sm text-gray-700 truncate">{habit.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Keep the streak statistics section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-bold text-lg mb-2">Streak Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-3xl font-bold text-orange-500 mb-1">
                        {longestStreak} {/* Use calculated longestStreak */}
                      </div>
                      <div className="text-sm text-gray-600">Longest Current Streak</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-3xl font-bold text-blue-500 mb-1">
                        {activeStreaks?.length || 0} {/* Use activeStreaks prop */}
                      </div>
                      <div className="text-sm text-gray-600">Active Streaks</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-3xl font-bold text-green-500 mb-1">
                        {streakMultiplier}x {/* Use streakMultiplier prop */}
                      </div>
                      <div className="text-sm text-gray-600">XP Multiplier</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Keep the habit consistency insights section */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-3">Habit Consistency Insights</h3>
                <ul className="space-y-2 text-gray-700">
                  {activeStreaks.length > 0 ? (
                    <>
                      <li className="flex items-center text-green-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Your most consistent habit is {activeStreaks?.sort((a, b) => b.streak - a.streak)[0]?.name || 'none'} with a {longestStreak} day streak! {/* Use activeStreaks & longestStreak */}
                      </li>
                      <li className="flex items-center text-orange-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        You have {activeStreaks?.length} active streaks, earning you a {streakMultiplier}x XP multiplier! {/* Use activeStreaks & streakMultiplier */}
                      </li>
                    </>
                  ) : (
                    <li className="text-gray-500 py-2">
                      No active streaks yet. Complete habits on consecutive days to build streaks! {/* Check activeStreaks prop */}
                    </li>
                  )}
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Tip: Start small and be consistent. Even a 2-day streak gives you an XP bonus!
                  </li>
                </ul>
              </div>
            </>
          )}
          
          {activeTab === 'records' && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-bold text-lg mb-3">Personal Records Progress</h3>
                  {prData.length > 0 ? (
                    prData.map((record, i) => (
                      <ProgressRecord 
                        key={i}
                        name={record.name}
                        previousValue={record.previousValue}
                        currentValue={record.currentValue}
                        unit={record.unit}
                        improvement={record.improvement}
                      />
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No personal records added yet. Create some on the main dashboard!
                    </div>
                  )}
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
                    {prData.length > 0 ? (
                      `Your most improved record is ${prData.sort((a, b) => b.improvement - a.improvement)[0]?.name} (+${prData.sort((a, b) => b.improvement - a.improvement)[0]?.improvement} ${prData.sort((a, b) => b.improvement - a.improvement)[0]?.unit})`
                    ) : (
                      'Add personal records to track your improvements!'
                    )}
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    {prData.length > 0 ? 'You\'re averaging a 20% improvement in records this month' : 'Start tracking your progress by adding records!'}
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

export default ProgressDashboard;