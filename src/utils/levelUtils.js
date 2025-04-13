// Calculate XP required based on current level
export const getMaxXpForLevel = (currentLevel) => {
  return 100 + (currentLevel - 1) * 10;
};

// Dynamically reference the avatar image based on the current level
export const getAvatarImage = (level) => {
  // We have images for levels 1-3
  const maxImageLevel = 3;
  // If the level is higher than what we have images for, use the highest one we have
  const imageLevel = level > maxImageLevel ? maxImageLevel : level;
  // Return the avatar image path based on the level
  return `/Rogue_lvl_0${imageLevel}.png`;
};