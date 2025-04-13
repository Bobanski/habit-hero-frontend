// Calculate streak multiplier - 0.1x per streak habit, max 1.5x
// Note: This function requires the 'habits' array as an argument now.
export const calculateStreakMultiplier = (habits) => {
  // Count habits with streak >= 2
  const streakHabits = habits.filter(habit => habit.streak >= 2).length;
  // 0.1x per streak, baseline is 1.0x, cap at 1.5x
  return Math.min(1 + (streakHabits * 0.1), 1.5);
};