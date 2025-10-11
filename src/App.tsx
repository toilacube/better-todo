import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { Header } from "./components/Header";
import { TaskInput } from "./components/TaskInput";
import { TaskItem } from "./components/TaskItem";
import { Settings } from "./components/Settings";
import { Statistics } from "./components/Statistics";
import { useTasks } from "./hooks/useTasks";
import { useHistory } from "./hooks/useHistory";
import { useSettings } from "./hooks/useSettings";
import { useDarkMode } from "./hooks/useDarkMode";
import { storage } from "./store/storage";
import { isNewDay, getTodayDateString } from "./utils/dateHelpers";
import { getIncompleteTasks } from "./utils/taskHelpers";
import { TabType } from "./types";
import "./App.css";

type View = "main" | "statistics";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("daily");
  const [view, setView] = useState<View>("main");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { settings, updateSettings } = useSettings();
  const { addHistoryEntry, getAllHistoryEntries } = useHistory();
  const dailyTasks = useTasks("daily");
  const mustDoTasks = useTasks("mustDo");

  // Apply dark mode
  useDarkMode(settings.darkMode);

  // Get current tasks based on active tab
  const currentTasks = activeTab === "daily" ? dailyTasks : mustDoTasks;

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
    if (activeTab !== "mustDo") return;

    const checkReminders = () => {
      const incompleteTasks = mustDoTasks.tasks.filter(
        (task) => !task.completed
      );
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

  if (view === "statistics") {
    return (
      <Statistics
        history={getAllHistoryEntries()}
        onBack={() => setView("main")}
      />
    );
  }

  return (
    <div className="app">
      <Header
        onStatsClick={() => setView("statistics")}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onThemeToggle={handleThemeToggle}
        darkMode={settings.darkMode}
      />

      <motion.div
        className="tabs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <button
          onClick={() => setActiveTab("daily")}
          className={`tab ${activeTab === "daily" ? "active" : ""}`}
        >
          Daily
        </button>
        <button
          onClick={() => setActiveTab("mustDo")}
          className={`tab ${activeTab === "mustDo" ? "active" : ""}`}
        >
          Must-Do
        </button>
      </motion.div>

      <main className="main-content">
        <div className="toolbar">
          <TaskInput onAdd={currentTasks.addTask} />
          {currentTasks.tasks.length > 0 && (
            <div className="expand-collapse-buttons">
              <motion.button
                onClick={currentTasks.toggleExpandCollapse}
                className="toolbar-button"
                aria-label={
                  currentTasks.allExpanded ? "Collapse all" : "Expand all"
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {currentTasks.allExpanded ? (
                  <>
                    <ChevronsUp size={18} strokeWidth={1.5} />
                    <span>Collapse All</span>
                  </>
                ) : (
                  <>
                    <ChevronsDown size={18} strokeWidth={1.5} />
                    <span>Expand All</span>
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="tasks-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentTasks.tasks.length === 0 ? (
              <motion.div
                className="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                NO TASKS YET
                <br />
                <span style={{ fontSize: "0.85em", opacity: 0.7 }}>
                  Press Enter to add one
                </span>
              </motion.div>
            ) : (
              currentTasks.tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <TaskItem
                    task={task}
                    onToggle={currentTasks.toggleTask}
                    onDelete={currentTasks.removeTask}
                    onAddSubtask={currentTasks.addSubtaskToTask}
                    onToggleExpand={currentTasks.toggleExpansion}
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
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
