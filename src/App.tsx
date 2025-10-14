import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { Header } from "./components/Header";
import { TaskInput } from "./components/TaskInput";
import { TaskItem } from "./components/TaskItem";
import { Settings } from "./components/Settings";
import { Statistics } from "./components/Statistics";
import { Debug } from "./components/Debug";
import { LearningView } from "./components/LearningView";
import { useTasks } from "./hooks/useTasks";
import { useHistory } from "./hooks/useHistory";
import { useSettings } from "./hooks/useSettings";
import { useDarkMode } from "./hooks/useDarkMode";
import { useNotification } from "./hooks/useNotification";
import { storage } from "./store/storage";
import { isNewDay, getTodayDateString } from "./utils/dateHelpers";
import { getIncompleteTasks } from "./utils/taskHelpers";
import { TabType } from "./types";
import "./App.css";

type View = "main" | "statistics" | "debug";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [view, setView] = useState<View>("main");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const { settings, updateSettings } = useSettings(reloadTrigger);
  const { addHistoryEntry, getAllHistoryEntries } = useHistory(reloadTrigger);
  const todayTasks = useTasks("today", reloadTrigger);
  const mustDoTasks = useTasks("mustDo", reloadTrigger);
  const { notify } = useNotification();

  // Apply dark mode
  useDarkMode(settings.darkMode);

  // Get current tasks based on active tab
  const currentTasks = activeTab === "today" ? todayTasks : mustDoTasks;

  // Check for day transition on mount and periodically
  useEffect(() => {
    const checkDayTransition = async () => {
      const lastDate = await storage.getLastDate();

      if (isNewDay(lastDate)) {
        // Save yesterday's tasks to history
        const yesterdayTodayTasks = await storage.getTodayTasks();
        if (yesterdayTodayTasks.length > 0) {
          await addHistoryEntry(lastDate, yesterdayTodayTasks);
        }

        // Handle carry-over or clear
        if (settings.autoCarryOver) {
          const incompleteTasks = getIncompleteTasks(yesterdayTodayTasks);
          await storage.setTodayTasks(incompleteTasks);
          todayTasks.updateTasks(incompleteTasks);
        } else {
          await storage.setTodayTasks([]);
          todayTasks.updateTasks([]);
        }

        // Update last date
        await storage.setLastDate(getTodayDateString());
      }
    };

    checkDayTransition();

    // Check every minute
    const interval = setInterval(checkDayTransition, 60000);

    return () => clearInterval(interval);
  }, [settings.autoCarryOver, addHistoryEntry, todayTasks]);

  // Must-Do reminders
  useEffect(() => {
    const checkReminders = () => {
      const incompleteTasks = mustDoTasks.tasks.filter(
        (task) => !task.completed
      );
      if (incompleteTasks.length > 0) {
        notify(
          "Must-Do Tasks Reminder",
          `You have ${incompleteTasks.length} incomplete Must-Do task${
            incompleteTasks.length > 1 ? "s" : ""
          }!`
        );
      }
    };

    // Set up periodic reminders if there are incomplete Must-Do tasks
    // Notifications run every X hours based on notifyInterval setting
    if (mustDoTasks.tasks.some((task) => !task.completed)) {
      const intervalMs = settings.notifyInterval * 60 * 60 * 1000;
      const interval = setInterval(checkReminders, intervalMs);

      return () => clearInterval(interval);
    }
  }, [mustDoTasks.tasks, settings.notifyInterval, notify]);

  const handleThemeToggle = async () => {
    await updateSettings({ darkMode: !settings.darkMode });
  };

  if (view === "statistics") {
    return (
      <Statistics
        history={getAllHistoryEntries()}
        todayTasks={todayTasks.tasks}
        mustDoTasks={mustDoTasks.tasks}
        onBack={() => setView("main")}
      />
    );
  }

  if (view === "debug") {
    return <Debug onBack={() => {
      setView("main");
      setReloadTrigger(prev => prev + 1);
    }} />;
  }

  return (
    <div className="app">
      <Header
        onStatsClick={() => setView("statistics")}
        onDebugClick={() => setView("debug")}
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
          onClick={() => setActiveTab("today")}
          className={`tab ${activeTab === "today" ? "active" : ""}`}
        >
          Today
        </button>
        <button
          onClick={() => setActiveTab("mustDo")}
          className={`tab ${activeTab === "mustDo" ? "active" : ""}`}
        >
          Must-Do
        </button>
        <button
          onClick={() => setActiveTab("learning")}
          className={`tab ${activeTab === "learning" ? "active" : ""}`}
        >
          Learning
        </button>
      </motion.div>

      <main className="main-content">
        {activeTab === "learning" ? (
          <LearningView />
        ) : (
          <>
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

        {activeTab === "mustDo" && (
          <motion.div
            className="must-do-description"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            This is for must-do daily task list, the app will notify you each{" "}
            {settings.notifyInterval} hour
            {settings.notifyInterval > 1 ? "s" : ""} until you completed all
            tasks in must-do.
          </motion.div>
        )}

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
          </>
        )}
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
