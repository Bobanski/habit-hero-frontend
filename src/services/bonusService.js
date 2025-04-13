/**
 * Handles the daily login bonus calculation.
 * Compares the last login date to determine if the user gets a streak bonus.
 *
 * @param {string|null} lastLoginDate - User's last login date (YYYY-MM-DD format) or null if first login.
 * @param {string} currentDate - Today's date in YYYY-MM-DD format.
 * @param {number} currentStreak - User's current login streak count.
 * @returns {object} - Object with new streak, bonus XP, and a flag indicating if the bonus modal should be shown.
 */
export function handleDailyLoginBonus(lastLoginDate, currentDate, currentStreak = 0) {
  // Default values if this is the first login or streak is undefined
  let newStreak = 1;
  let showBonusModal = true;

  // Base XP for any login
  const baseBonusXp = 10;
  // Cap the max bonus at 50 XP (streak of 9+)
  const maxBonusXp = 50; // base + 40 streak bonus

  // If there's a previous login date to compare
  if (lastLoginDate) {
    // Parse the dates to compare
    const lastDate = new Date(lastLoginDate + 'T00:00:00'); // Ensure parsing as local date
    const today = new Date(currentDate + 'T00:00:00'); // Ensure parsing as local date

    // Calculate the difference in days (considering potential DST changes)
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // If user logged in yesterday (1 day difference)
    if (diffDays === 1) {
      // Increment streak for consecutive login
      newStreak = currentStreak + 1;
    }
    // If already logged in today, don't show bonus
    else if (diffDays === 0) {
      showBonusModal = false;
      newStreak = currentStreak; // Keep current streak
    }
    // Otherwise (gap in logins > 1 day or < 0 due to time zone issues), reset streak
    else {
      newStreak = 1;
    }
  }

  // Calculate bonus XP based on streak (base + 5 XP per day in streak, capped)
  const streakBonus = Math.min((newStreak - 1) * 5, maxBonusXp - baseBonusXp);
  const bonusXp = baseBonusXp + streakBonus;

  return {
    newStreak,
    bonusXp,
    showBonusModal
  };
}