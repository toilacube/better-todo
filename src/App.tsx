import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TaskInput } from './components/TaskInput';
import { TaskItem } from './components/TaskItem';
import { Settings } from './components/Settings';
import { Statistics } from './components/Statistics';
import { useTasks } from './hooks/useTasks';
import { useHistory } from './hooks/useHistory';
import { useSettings } from './hooks/useSettings';
import { useDarkMode } from './hooks/useDarkMode';
import { storage } from './store/storage';
import { isNewDay, getTodayDateString } from './utils/dateHelpers';
import { getIncompleteTasks } from './utils/taskHelpers';
import { TabType } from './types';
import './App.css';

type View = 'main' | 'statistics';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [view, setView] = useState<View>('main');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { settings, updateSettings } = useSettings();
  const { addHistoryEntry, getAllHistoryEntries } = useHistory();
  const dailyTasks = useTasks('daily');
  const mustDoTasks = useTasks('mustDo');

  // Apply dark mode
  useDarkMode(settings.darkMode);

  // Get current tasks based on active tab
  const currentTasks = activeTab === 'daily' ? dailyTasks : mustDoTasks;

  // Check for day transition on mount and periodically
  useEffect(() => {
    const checkDayTransition = () => {
      const lastDate = storage.getLastDate();

      if (isNewDay(lastDate)) {
        // Save yesterday's tasks to history
        const yesterdayDailyTasks = storage.getDailyTasks();
        if (yesterdayDailyTasks.length > 0) {
          addHistoryEntry(lastDate, yesterdayDailyTasks);
        }

        // Handle carry-over or clear
        if (settings.autoCarryOver) {
          const incompleteTasks = getIncompleteTasks(yesterdayDailyTasks);
          storage.setDailyTasks(incompleteTasks);
          dailyTasks.updateTasks(incompleteTasks);
        } else {
          storage.setDailyTasks([]);
          dailyTasks.updateTasks([]);
        }

        // Update last date
        storage.setLastDate(getTodayDateString());
      }
    };

    checkDayTransition();

    // Check every minute
    const interval = setInterval(checkDayTransition, 60000);

    return () => clearInterval(interval);
  }, [settings.autoCarryOver]);

  // Must-Do reminders
  useEffect(() => {
    if (activeTab !== 'mustDo') return;

    const checkReminders = () => {
      const incompleteTasks = mustDoTasks.tasks.filter((task) => !task.completed);
      if (incompleteTasks.length > 0) {
        alert(`Bạn có ${incompleteTasks.length} Must-Do task chưa hoàn thành!`);
      }
    };

    // Set interval based on settings
    const intervalMs = settings.notifyInterval * 60 * 60 * 1000;
    const interval = setInterval(checkReminders, intervalMs);

    return () => clearInterval(interval);
  }, [activeTab, mustDoTasks.tasks, settings.notifyInterval]);

  const handleThemeToggle = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  if (view === 'statistics') {
    return (
      <Statistics
        history={getAllHistoryEntries()}
        onBack={() => setView('main')}
      />
    );
  }

  return (
    <div className="app">
      <Header
        onStatsClick={() => setView('statistics')}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onThemeToggle={handleThemeToggle}
        darkMode={settings.darkMode}
      />

      <div className="tabs">
        <button
          onClick={() => setActiveTab('daily')}
          className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
        >
          Daily
        </button>
        <button
          onClick={() => setActiveTab('mustDo')}
          className={`tab ${activeTab === 'mustDo' ? 'active' : ''}`}
        >
          Must-Do
        </button>
      </div>

      <main className="main-content">
        <TaskInput onAdd={currentTasks.addTask} />

        <div className="tasks-container">
          {currentTasks.tasks.length === 0 ? (
            <div className="empty-state">Không có task nào</div>
          ) : (
            currentTasks.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={currentTasks.toggleTask}
                onDelete={currentTasks.removeTask}
                onAddSubtask={currentTasks.addSubtaskToTask}
                onToggleExpand={currentTasks.toggleExpansion}
              />
            ))
          )}
        </div>
      </main>

      <Settings
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdate={updateSettings}
      />
    </div>
  );
}

export default App;
