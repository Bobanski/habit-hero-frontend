import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook to manage various UI-related states.
 *
 * @returns {object} An object containing UI states and functions to modify them.
 */
export function useUI() {
  const [activePanel, setActivePanel] = useState(null);
  const [view, setView] = useState("dashboard"); // "dashboard" or "analytics"
  const [xpGainAnimation, setXpGainAnimation] = useState({ show: false, amount: 0 });
  const [dailyBonusInfo, setDailyBonusInfo] = useState({ show: false, streak: 0, xp: 0 });

  // Function to toggle panels open/closed
  const openPanel = useCallback((panelName) => {
    setActivePanel(currentPanel => (currentPanel === panelName ? null : panelName));
  }, []);

  // Function to trigger the XP gain animation
  const triggerXpGainAnimation = useCallback((amount) => {
    setXpGainAnimation({ show: true, amount });
    // Automatically hide after a delay
    const timerId = setTimeout(() => {
      setXpGainAnimation({ show: false, amount: 0 });
    }, 2000); // Animation duration
    return () => clearTimeout(timerId); // Return cleanup function
  }, []);

   // Function to show the daily bonus modal
   const showDailyBonus = useCallback((streak, xp) => {
    setDailyBonusInfo({ show: true, streak, xp });
     // Automatically hide after a delay
     const timerId = setTimeout(() => {
        setDailyBonusInfo({ show: false, streak: 0, xp: 0 });
     }, 4000); // Modal display duration
     return () => clearTimeout(timerId); // Return cleanup function
   }, []);

  // Helper function to check if a specific panel is open
  const isPanelOpen = useCallback((panelName) => {
    return activePanel === panelName;
  }, [activePanel]);

  return {
    activePanel,
    setActivePanel, // Expose setter if direct control is needed
    openPanel,
    isPanelOpen,
    view,
    setView,
    xpGainAnimation,
    triggerXpGainAnimation, // Use this instead of direct setXpGainAnimation
    dailyBonusInfo,
    showDailyBonus // Use this instead of direct setDailyBonusInfo
  };
}