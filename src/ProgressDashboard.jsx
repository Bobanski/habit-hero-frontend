import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ProgressDashboard({
  user, xp, level, maxXp, avatarImage, habits, personalRecords, todos,
  activeStreaks, streakMultiplier, previewXp, activePanel, openPanel, panelAnchorPos, setPanelAnchorPos,
  newHabitName, setNewHabitName, newHabitXp, setNewHabitXp, handleAddNewHabit,
  toggleHabitSelection, handleSubmitHabits, resetHabitSelections,
  newPrName, setNewPrName, newPrValue, setNewPrValue, newPrUnit, setNewPrUnit,
  handleAddPersonalRecord, handleTiePR, handleBeatPR,
  newTodo, setNewTodo, handleAddTodo, handleToggleTodo,
  XPBarComponent, HabitItemComponent, StreakItemComponent
}) {
  const containerRef = useRef(null);
  const habitsButtonRef = useRef(null);
  const prsButtonRef = useRef(null);
  const streaksButtonRef = useRef(null);
  const todosButtonRef = useRef(null);

  const panelVariants = {
    hidden: { opacity: 0, height: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: "easeInOut" } },
  };

  const getSurroundingButtonStyles = (panelName, baseColors) => {
    return `absolute w-48 h-16 rounded-lg shadow-lg text-white font-semibold text-sm flex items-center justify-center text-center transition-transform transform hover:scale-105 ${baseColors} ${activePanel === panelName ? 'ring-4 ring-offset-2 ring-yellow-400' : ''}`;
  };

  const horizontalGap = '30%';
  const verticalGap = '35%';

  const buttonPositions = {
    habits: { top: `calc(50% - ${verticalGap})`, left: `calc(50% - ${horizontalGap})`, transform: 'translate(-50%, -50%)' },
    prs:    { top: `calc(50% - ${verticalGap})`, left: `calc(50% + ${horizontalGap})`, transform: 'translate(-50%, -50%)' },
    streaks:{ top: `calc(50% + ${verticalGap})`, left: `calc(50% - ${horizontalGap})`, transform: 'translate(-50%, -50%)' },
    todos:  { top: `calc(50% + ${verticalGap})`, left: `calc(50% + ${horizontalGap})`, transform: 'translate(-50%, -50%)' }
  };

  const handlePanelClick = (panelName, ref) => {
    const buttonRect = ref.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    setPanelAnchorPos({
      top: buttonRect.bottom - containerRect.top + 10,
      left: buttonRect.left - containerRect.left + buttonRect.width / 2,
    });

    openPanel(panelName);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center px-4 min-h-[calc(100vh-150px)]">
      <div className="relative w-full flex justify-center items-center my-8" style={{ height: '550px' }} ref={containerRef}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          <div className="relative">
            <img src={avatarImage} alt="User Avatar" className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-white shadow-xl" />
            <div className="absolute bottom-5 right-5 bg-blue-500 text-white text-xl font-bold rounded-full w-14 h-14 flex items-center justify-center border-2 border-white shadow">
              {level}
            </div>
          </div>
          <p className="mt-3 text-lg font-semibold text-gray-700">{user?.username}</p>
        </div>

        <motion.button
          ref={habitsButtonRef}
          onClick={() => handlePanelClick('habits', habitsButtonRef)}
          className={getSurroundingButtonStyles('habits', 'bg-gradient-to-br from-green-500 to-emerald-600')}
          style={buttonPositions.habits}
        >
          Habits
        </motion.button>

        <motion.button
          ref={prsButtonRef}
          onClick={() => handlePanelClick('prs', prsButtonRef)}
          className={getSurroundingButtonStyles('prs', 'bg-gradient-to-br from-purple-500 to-indigo-600')}
          style={buttonPositions.prs}
        >
          Records
        </motion.button>

        <motion.button
          ref={streaksButtonRef}
          onClick={() => handlePanelClick('streaks', streaksButtonRef)}
          className={getSurroundingButtonStyles('streaks', 'bg-gradient-to-br from-orange-400 to-red-500')}
          style={buttonPositions.streaks}
        >
          Streaks 🔥
        </motion.button>

        <motion.button
          ref={todosButtonRef}
          onClick={() => handlePanelClick('todos', todosButtonRef)}
          className={getSurroundingButtonStyles('todos', 'bg-gradient-to-br from-cyan-500 to-blue-600')}
          style={buttonPositions.todos}
        >
          To-Dos
        </motion.button>

        <AnimatePresence mode="wait">
          {activePanel && (
            <motion.div
              key={activePanel}
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-white rounded-lg shadow-xl p-2 sm:p-3 max-w-xs absolute z-50"
              style={{
                top: `${panelAnchorPos.top}px`,
                left: `${panelAnchorPos.left}px`,
                transform: 'translateX(-50%)',
              }}
            >
              {activePanel === 'habits' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-green-700">Manage Habits</h3>
                  {habits?.map(habit => (
                    <HabitItemComponent key={habit.id} habit={habit} onChange={toggleHabitSelection} editable multiplier={streakMultiplier} />
                  ))}
                  {habits?.length === 0 && <p className="text-gray-500 text-sm py-4 text-center">No habits yet.</p>}
                  <form onSubmit={handleAddNewHabit} className="mt-4 pt-4 border-t">
                    <input type="text" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} placeholder="New Habit Name" className="w-full px-3 py-2 border rounded mb-2" />
                    <input type="number" value={newHabitXp} onChange={(e) => setNewHabitXp(e.target.value)} placeholder="XP Value" className="w-full px-3 py-2 border rounded mb-2" />
                    <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">Add Habit</button>
                  </form>
                  {habits?.some(h => h.selected) && (
                    <div className="mt-4 flex space-x-2">
                      <button onClick={handleSubmitHabits} className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Submit Selected ({habits.filter(h => h.selected).length})</button>
                      <button onClick={resetHabitSelections} className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400">Reset</button>
                    </div>
                  )}
                </div>
              )}

              {activePanel === 'prs' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-purple-700">Manage Personal Records</h3>
                  {personalRecords?.map(pr => (
                    <div key={pr.id} className="py-2 border-b flex justify-between items-center">
                      <span>{pr.name}: {pr.current} {pr.unit}</span>
                      <div className="space-x-1">
                        <button onClick={() => handleTiePR(pr.id)} className="text-xs bg-yellow-400 px-1.5 py-0.5 rounded hover:bg-yellow-500">Tie</button>
                        <button onClick={() => handleBeatPR(pr.id)} className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded hover:bg-red-600">Beat!</button>
                      </div>
                    </div>
                  ))}
                  {personalRecords?.length === 0 && <p className="text-gray-500 text-sm py-4 text-center">No records yet.</p>}
                  <form onSubmit={handleAddPersonalRecord} className="mt-4 pt-4 border-t">
                    <input type="text" value={newPrName} onChange={(e) => setNewPrName(e.target.value)} placeholder="New Record Name" className="w-full px-3 py-2 border rounded mb-2" />
                    <div className="flex space-x-2 mb-2">
                      <input type="number" value={newPrValue} onChange={(e) => setNewPrValue(e.target.value)} placeholder="Value" className="flex-grow px-3 py-2 border rounded" />
                      <select value={newPrUnit} onChange={(e) => setNewPrUnit(e.target.value)} className="px-3 py-2 border rounded bg-white">
                        <option value="reps">reps</option>
                        <option value="seconds">seconds</option>
                        <option value="minutes">minutes</option>
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                        <option value="km">km</option>
                        <option value="miles">miles</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600">Add Record</button>
                  </form>
                </div>
              )}

              {activePanel === 'streaks' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-orange-600">Active Streaks</h3>
                  {activeStreaks?.map(habit => (
                    <StreakItemComponent key={`streak-${habit.id}`} habit={habit} />
                  ))}
                  {activeStreaks?.length === 0 && <p className="text-gray-500 text-sm py-4 text-center">No active streaks.</p>}
                  <p className="text-sm text-gray-600 mt-4 pt-2 border-t">XP Multiplier: <strong>{streakMultiplier}x</strong></p>
                </div>
              )}

              {activePanel === 'todos' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-cyan-700">To-Do List</h3>
                  {todos?.map(todo => (
                    <div key={todo.id} className="py-2 border-b flex items-center space-x-2">
                      <input type="checkbox" checked={todo.completed} onChange={() => handleToggleTodo(todo.id)} className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500" />
                      <span className={`flex-grow ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{todo.text}</span>
                    </div>
                  ))}
                  {todos?.length === 0 && <p className="text-gray-500 text-sm py-4 text-center">No to-dos yet.</p>}
                  <form onSubmit={handleAddTodo} className="mt-4 pt-4 border-t">
                    <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="New To-Do Item" className="w-full px-3 py-2 border rounded mb-2" />
                    <button type="submit" className="w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600">Add To-Do</button>
                  </form>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-md mt-auto pt-6 pb-4">
        <XPBarComponent xp={xp} maxXp={maxXp} previewXp={previewXp} />
        <p className="text-xs text-gray-500 text-right mt-1">{xp} / {maxXp} XP</p>
      </div>
    </div>
  );
}

export default ProgressDashboard;
