import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import BarChart from './components/BarChart';
import LineChart from './components/LineChart';

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
          transition={{ duration: 0.8, ease: 'easeOut' }}
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

  const xpData = userData?.xpHistory?.slice(-5) || [];
  const streakData = userData?.streakHistory || [];
  const prData = userData?.personalRecords || [];
  const habitXpData = userData?.habits?.map(habit => ({
    label: habit.name,
    value: habit.totalXp || 0 // Use totalXp tracked by backend
  })) || [];

  const highestXpDay = Math.max(...(userData?.xpHistory?.slice(-7).map(day => day.value) || [0]), 0);
  const totalXpLast7Days = (userData?.xpHistory?.slice(-7) || []).reduce((sum, day) => sum + day.value, 0);

  // --- DEBUG LOGS ---
  console.log("ProgressAnalytics userData:", userData);
  console.log("Data for Bar Chart (Habit XP):", habitXpData);
  console.log("Data for Line Chart (XP History):", xpData);
  // --- END DEBUG LOGS ---

  return (
    <motion.div className="min-h-screen bg-gray-100 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Progress Analytics Dashboard</h1>
        </div>

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

        <div className="flex space-x-2 mb-6">
          <button onClick={() => setActiveTab('xp')} className={`py-2 px-4 rounded-lg transition ${activeTab === 'xp' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'}`}>XP Analytics</button>
          <button onClick={() => setActiveTab('streaks')} className={`py-2 px-4 rounded-lg transition ${activeTab === 'streaks' ? 'bg-orange-500 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'}`}>Streaks</button>
          <button onClick={() => setActiveTab('records')} className={`py-2 px-4 rounded-lg transition ${activeTab === 'records' ? 'bg-purple-500 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'}`}>Personal Records</button>
        </div>

        <div className="space-y-6">
          {activeTab === 'xp' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BarChart data={habitXpData} title="XP Gain per Habit (All Time)" color="bg-green-500" />
              <LineChart data={xpData} title="XP Gained per Day (Last 5 Days)" color="bg-blue-500" />
            </div>
          )}

          {activeTab === 'streaks' && (
            <LineChart data={streakData} title="Streak Growth Over Time" color="bg-orange-500" />
          )}

          {activeTab === 'records' && (
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
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ProgressAnalytics;
