import { useState, useEffect } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { storage } from "../store/storage";
import {
  Task,
  TaskHistory,
  Settings,
  LearningTopic,
  LearningHistory,
  LearningSettings,
  LearningStatistics,
} from "../types";
import { useNotification } from "../hooks/useNotification";
import { getCurrentWeekId, getWeekDisplayString } from "../utils/weekHelpers";
import { countTopics } from "../utils/learningHelpers";
import "../styles/Debug.css";

interface DebugProps {
  onBack?: () => void;
}

interface StoreData {
  todayTasks: Task[];
  mustDoTasks: Task[];
  taskHistory: TaskHistory;
  lastDate: string;
  settings: Settings;
  // Learning data
  currentWeekTopics: LearningTopic[];
  learningHistory: LearningHistory;
  lastWeekId: string;
  learningSettings: LearningSettings;
  learningStatistics: LearningStatistics;
}

export function Debug({ onBack }: DebugProps = {}) {
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    todayTasks: true,
    mustDoTasks: true,
    taskHistory: false,
    settings: true,
    general: true,
    // Learning sections
    learningGeneral: true,
    currentWeekTopics: true,
    learningHistory: false,
    learningSettings: true,
    learningStatistics: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedJson, setEditedJson] = useState<string>("");
  const [parsedData, setParsedData] = useState<StoreData | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [notificationTestResult, setNotificationTestResult] = useState<
    string | null
  >(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { notify, permissionGranted } = useNotification();

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        todayTasks,
        mustDoTasks,
        taskHistory,
        lastDate,
        settings,
        currentWeekTopics,
        learningHistory,
        lastWeekId,
        learningSettings,
        learningStatistics,
      ] = await Promise.all([
        storage.getTodayTasks(),
        storage.getMustDoTasks(),
        storage.getTaskHistory(),
        storage.getLastDate(),
        storage.getSettings(),
        storage.getCurrentWeekTopics(),
        storage.getLearningHistory(),
        storage.getLastWeekId(),
        storage.getLearningSettings(),
        storage.getLearningStatistics(),
      ]);

      setStoreData({
        todayTasks,
        mustDoTasks,
        taskHistory,
        lastDate,
        settings,
        currentWeekTopics,
        learningHistory,
        lastWeekId,
        learningSettings,
        learningStatistics,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load store data"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatJson = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  const validateStoreData = (data: any): string[] => {
    const errors: string[] = [];

    if (!data || typeof data !== "object") {
      errors.push("Data must be a valid object");
      return errors;
    }

    // Check required fields
    const requiredFields = [
      "todayTasks",
      "mustDoTasks",
      "taskHistory",
      "lastDate",
      "settings",
      "currentWeekTopics",
      "learningHistory",
      "lastWeekId",
      "learningSettings",
      "learningStatistics",
    ];
    requiredFields.forEach((field) => {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate todayTasks
    if (data.todayTasks && !Array.isArray(data.todayTasks)) {
      errors.push("todayTasks must be an array");
    } else if (data.todayTasks) {
      data.todayTasks.forEach((task: any, index: number) => {
        if (!validateTask(task)) {
          errors.push(`Invalid task at todayTasks[${index}]`);
        }
      });
    }

    // Validate mustDoTasks
    if (data.mustDoTasks && !Array.isArray(data.mustDoTasks)) {
      errors.push("mustDoTasks must be an array");
    } else if (data.mustDoTasks) {
      data.mustDoTasks.forEach((task: any, index: number) => {
        if (!validateTask(task)) {
          errors.push(`Invalid task at mustDoTasks[${index}]`);
        }
      });
    }

    // Validate taskHistory
    if (data.taskHistory && typeof data.taskHistory !== "object") {
      errors.push("taskHistory must be an object");
    }

    // Validate lastDate
    if (data.lastDate && typeof data.lastDate !== "string") {
      errors.push("lastDate must be a string");
    }

    // Validate settings
    if (data.settings) {
      if (typeof data.settings !== "object") {
        errors.push("settings must be an object");
      } else {
        const settingsFields = [
          "autoCarryOver",
          "notifyInterval",
          "darkMode",
          "autoStart",
        ];
        settingsFields.forEach((field) => {
          if (!(field in data.settings)) {
            errors.push(`Missing required settings field: ${field}`);
          }
        });

        if (typeof data.settings.autoCarryOver !== "boolean") {
          errors.push("settings.autoCarryOver must be a boolean");
        }
        if (typeof data.settings.notifyInterval !== "number") {
          errors.push("settings.notifyInterval must be a number");
        }
        if (typeof data.settings.darkMode !== "boolean") {
          errors.push("settings.darkMode must be a boolean");
        }
        if (typeof data.settings.autoStart !== "boolean") {
          errors.push("settings.autoStart must be a boolean");
        }
      }
    }

    // Validate Learning fields
    // Validate currentWeekTopics
    if (data.currentWeekTopics && !Array.isArray(data.currentWeekTopics)) {
      errors.push("currentWeekTopics must be an array");
    } else if (data.currentWeekTopics) {
      data.currentWeekTopics.forEach((topic: any, index: number) => {
        if (!validateLearningTopic(topic)) {
          errors.push(`Invalid learning topic at currentWeekTopics[${index}]`);
        }
      });
    }

    // Validate learningHistory
    if (data.learningHistory && typeof data.learningHistory !== "object") {
      errors.push("learningHistory must be an object");
    }

    // Validate lastWeekId
    if (data.lastWeekId && typeof data.lastWeekId !== "string") {
      errors.push("lastWeekId must be a string");
    }

    // Validate learningSettings
    if (data.learningSettings) {
      if (typeof data.learningSettings !== "object") {
        errors.push("learningSettings must be an object");
      } else {
        const learningSettingsFields = [
          "autoCreateNewWeek",
          "weekStartDay",
        ];
        learningSettingsFields.forEach((field) => {
          if (!(field in data.learningSettings)) {
            errors.push(`Missing required learningSettings field: ${field}`);
          }
        });

        if (typeof data.learningSettings.autoCreateNewWeek !== "boolean") {
          errors.push("learningSettings.autoCreateNewWeek must be a boolean");
        }
        if (typeof data.learningSettings.weekStartDay !== "number") {
          errors.push("learningSettings.weekStartDay must be a number");
        }
      }
    }

    // Validate learningStatistics
    if (
      data.learningStatistics &&
      typeof data.learningStatistics !== "object"
    ) {
      errors.push("learningStatistics must be an object");
    }

    return errors;
  };

  const validateTask = (task: any): boolean => {
    return (
      task &&
      typeof task === "object" &&
      typeof task.id === "number" &&
      typeof task.text === "string" &&
      typeof task.completed === "boolean" &&
      Array.isArray(task.subtasks) &&
      typeof task.expanded === "boolean"
    );
  };

  const validateLearningTopic = (topic: any): boolean => {
    return (
      topic &&
      typeof topic === "object" &&
      typeof topic.id === "number" &&
      typeof topic.title === "string" &&
      typeof topic.notes === "string" &&
      Array.isArray(topic.referenceLinks) &&
      Array.isArray(topic.subtopics) &&
      typeof topic.expanded === "boolean" &&
      typeof topic.completed === "boolean" &&
      topic.blogPost &&
      typeof topic.blogPost === "object" &&
      typeof topic.blogPost.written === "boolean" &&
      typeof topic.createdAt === "string" &&
      typeof topic.updatedAt === "string"
    );
  };

  const startEditing = () => {
    if (storeData) {
      setEditedJson(formatJson(storeData));
      setIsEditing(true);
      setJsonError(null);
      setValidationErrors([]);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedJson("");
    setJsonError(null);
    setValidationErrors([]);
    setSaveSuccess(false);
  };

  const handleSaveClick = () => {
    // Validate JSON first
    setJsonError(null);
    setValidationErrors([]);
    setParsedData(null);

    try {
      const parsed = JSON.parse(editedJson);
      const errors = validateStoreData(parsed);

      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Store parsed data to avoid re-parsing
      setParsedData(parsed);
      // Show confirmation dialog
      setShowConfirmation(true);
    } catch (err) {
      setJsonError(
        `Invalid JSON: ${err instanceof Error ? err.message : "Parse error"}`
      );
    }
  };

  const confirmSave = async () => {
    setShowConfirmation(false);
    await saveJson();
  };

  const cancelSave = () => {
    setShowConfirmation(false);
  };

  const saveJson = async () => {
    if (!parsedData) {
      setJsonError("No data to save. Please validate first.");
      return;
    }

    try {
      setSaving(true);
      setJsonError(null);
      setValidationErrors([]);
      setSaveSuccess(false);

      // Save all data atomically using batch operations
      await storage.setAll({
        todayTasks: parsedData.todayTasks,
        mustDoTasks: parsedData.mustDoTasks,
        taskHistory: parsedData.taskHistory,
        lastDate: parsedData.lastDate,
        settings: parsedData.settings,
      });

      await storage.setAllLearningData({
        currentWeekTopics: parsedData.currentWeekTopics,
        learningHistory: parsedData.learningHistory,
        lastWeekId: parsedData.lastWeekId,
        learningSettings: parsedData.learningSettings,
        learningStatistics: parsedData.learningStatistics,
      });

      // Reload data and exit editing mode
      await loadStoreData();
      setIsEditing(false);
      setEditedJson("");
      setParsedData(null);
      setSaveSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setJsonError(
        `Failed to save: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  //   const exportJson = () => {
  //     if (!storeData) return;

  //     const dataStr = formatJson(storeData);
  //     const dataBlob = new Blob([dataStr], { type: "application/json" });
  //     const url = URL.createObjectURL(dataBlob);
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = `better-todo-data-${new Date().toISOString().split("T")[0]}.json`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     URL.revokeObjectURL(url);
  //   };

  const testNotification = async () => {
    try {
      setNotificationTestResult(null);

      if (!permissionGranted) {
        setNotificationTestResult(
          "Notification permission not granted. Please enable notifications in your system settings."
        );
        return;
      }

      await notify(
        "Test Notification",
        "If you can see this, notifications are working correctly!"
      );
      setNotificationTestResult("Test notification sent successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setNotificationTestResult(null), 3000);
    } catch (err) {
      setNotificationTestResult(
        `Failed to send notification: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const renderTask = (task: Task, level = 0) => {
    return (
      <div key={task.id} className={`debug-task debug-task-level-${level}`}>
        <div className="debug-task-info">
          <span className="debug-task-id">ID: {task.id}</span>
          <span
            className={`debug-task-status ${
              task.completed ? "completed" : "pending"
            }`}
          >
            {task.completed ? "✓" : "○"}
          </span>
          <span className="debug-task-text">{task.text}</span>
          {task.subtasks.length > 0 && (
            <span className="debug-subtask-count">
              ({task.subtasks.length} subtasks)
            </span>
          )}
        </div>
        {task.subtasks.length > 0 && (
          <div className="debug-subtasks">
            {task.subtasks.map((subtask) => renderTask(subtask, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderLearningTopic = (topic: LearningTopic, level = 0) => {
    return (
      <div key={topic.id} className={`debug-task debug-task-level-${level}`}>
        <div className="debug-task-info">
          
          <span className="debug-task-text">{topic.title}</span>
          {topic.blogPost.written && (
            <span className="debug-blog-badge">
              <BookOpen size={14} /> Blog
            </span>
          )}
          {topic.referenceLinks.length > 0 && (
            <span className="debug-reference-count">
              ({topic.referenceLinks.length} refs)
            </span>
          )}
          {topic.subtopics.length > 0 && (
            <span className="debug-subtask-count">
              ({topic.subtopics.length} subtopics)
            </span>
          )}
        </div>
        {topic.subtopics.length > 0 && (
          <div className="debug-subtasks">
            {topic.subtopics.map((subtopic) =>
              renderLearningTopic(subtopic, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="debug-container">
        <div className="debug-loading">Loading store data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="debug-container">
        <div className="debug-error">
          <h3>Error loading store data</h3>
          <p>{error}</p>
          <button onClick={loadStoreData} className="debug-retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="debug-container">
        <div className="debug-error">No data available</div>
      </div>
    );
  }

  return (
    <div className="debug-container">
      <div className="debug-header">
        <div className="debug-header-left">
          {onBack && (
            <button onClick={onBack} className="debug-back-btn">
              <ArrowLeft size={20} />
              Back
            </button>
          )}
          <h2>Store Debug Information</h2>
        </div>
        <button onClick={loadStoreData} className="debug-refresh-btn">
          Refresh Data
        </button>
      </div>

      {/* General Information */}
      <div className="debug-section">
        <div
          className="debug-section-header"
          onClick={() => toggleSection("general")}
        >
          <span
            className={`debug-toggle ${
              expandedSections.general ? "expanded" : ""
            }`}
          >
            ▶
          </span>
          <h3>General Information</h3>
        </div>
        {expandedSections.general && (
          <div className="debug-section-content">
            <div className="debug-info-grid">
              <div className="debug-info-item">
                <strong>Last Date:</strong>
                <span>{storeData.lastDate}</span>
              </div>
              <div className="debug-info-item">
                <strong>Current Date:</strong>
                <span>{new Date().toDateString()}</span>
              </div>
              <div className="debug-info-item">
                <strong>Today Tasks Count:</strong>
                <span>{storeData.todayTasks.length}</span>
              </div>
              <div className="debug-info-item">
                <strong>Must-Do Tasks Count:</strong>
                <span>{storeData.mustDoTasks.length}</span>
              </div>
              <div className="debug-info-item">
                <strong>History Entries:</strong>
                <span>{Object.keys(storeData.taskHistory).length}</span>
              </div>
              <div className="debug-info-item">
                <strong>Learning Topics (Current Week):</strong>
                <span>{storeData.currentWeekTopics.length}</span>
              </div>
              <div className="debug-info-item">
                <strong>Learning History Weeks:</strong>
                <span>{Object.keys(storeData.learningHistory).length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Today Tasks */}
      <div className="debug-section">
        <div
          className="debug-section-header"
          onClick={() => toggleSection("todayTasks")}
        >
          <span
            className={`debug-toggle ${
              expandedSections.todayTasks ? "expanded" : ""
            }`}
          >
            ▶
          </span>
          <h3>Today Tasks ({storeData.todayTasks.length})</h3>
        </div>
        {expandedSections.todayTasks && (
          <div className="debug-section-content">
            {storeData.todayTasks.length === 0 ? (
              <div className="debug-empty">No tasks for today</div>
            ) : (
              <div className="debug-tasks-list">
                {storeData.todayTasks.map((task) => renderTask(task))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Must-Do Tasks */}
      <div className="debug-section">
        <div
          className="debug-section-header"
          onClick={() => toggleSection("mustDoTasks")}
        >
          <span
            className={`debug-toggle ${
              expandedSections.mustDoTasks ? "expanded" : ""
            }`}
          >
            ▶
          </span>
          <h3>Must-Do Tasks ({storeData.mustDoTasks.length})</h3>
        </div>
        {expandedSections.mustDoTasks && (
          <div className="debug-section-content">
            {storeData.mustDoTasks.length === 0 ? (
              <div className="debug-empty">No must-do tasks</div>
            ) : (
              <div className="debug-tasks-list">
                {storeData.mustDoTasks.map((task) => renderTask(task))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="debug-section">
        <div
          className="debug-section-header"
          onClick={() => toggleSection("settings")}
        >
          <span
            className={`debug-toggle ${
              expandedSections.settings ? "expanded" : ""
            }`}
          >
            ▶
          </span>
          <h3>Settings</h3>
        </div>
        {expandedSections.settings && (
          <div className="debug-section-content">
            <div className="debug-settings-grid">
              <div className="debug-setting-item">
                <strong>Auto Carry Over:</strong>
                <span
                  className={
                    storeData.settings.autoCarryOver ? "enabled" : "disabled"
                  }
                >
                  {storeData.settings.autoCarryOver ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="debug-setting-item">
                <strong>Notify Interval:</strong>
                <span>{storeData.settings.notifyInterval} hours</span>
              </div>
              <div className="debug-setting-item">
                <strong>Dark Mode:</strong>
                <span
                  className={
                    storeData.settings.darkMode ? "enabled" : "disabled"
                  }
                >
                  {storeData.settings.darkMode ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="debug-setting-item">
                <strong>Auto Start:</strong>
                <span
                  className={
                    storeData.settings.autoStart ? "enabled" : "disabled"
                  }
                >
                  {storeData.settings.autoStart ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Test */}
      <div className="debug-section">
        <div className="debug-section-header">
          <h3>Notification Test</h3>
        </div>
        <div className="debug-section-content">
          <div className="debug-notification-test">
            <div className="debug-notification-status">
              <strong>Permission Status:</strong>
              <span className={permissionGranted ? "enabled" : "disabled"}>
                {permissionGranted ? "Granted" : "Not Granted"}
              </span>
            </div>
            <button
              onClick={testNotification}
              className="debug-test-notification-btn"
            >
              Test Notification
            </button>
            {notificationTestResult && (
              <div
                className={`debug-notification-result ${
                  notificationTestResult.includes("success")
                    ? "success"
                    : "error"
                }`}
              >
                {notificationTestResult}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task History */}
      <div className="debug-section">
        <div
          className="debug-section-header"
          onClick={() => toggleSection("taskHistory")}
        >
          <span
            className={`debug-toggle ${
              expandedSections.taskHistory ? "expanded" : ""
            }`}
          >
            ▶
          </span>
          <h3>
            Task History ({Object.keys(storeData.taskHistory).length} entries)
          </h3>
        </div>
        {expandedSections.taskHistory && (
          <div className="debug-section-content">
            {Object.keys(storeData.taskHistory).length === 0 ? (
              <div className="debug-empty">No history entries</div>
            ) : (
              <div className="debug-history">
                {Object.entries(storeData.taskHistory)
                  .sort(
                    ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
                  )
                  .map(([date, entry]) => (
                    <div key={date} className="debug-history-entry">
                      <div className="debug-history-header">
                        <strong>{date}</strong>
                        <span className="debug-history-stats">
                          {entry.completed}/{entry.total} completed
                        </span>
                      </div>
                      <div className="debug-history-tasks">
                        {entry.tasks.map((task) => renderTask(task))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Learning General Information */}
      <div className="debug-section">
        <div
          className="debug-section-header"
          onClick={() => toggleSection("learningGeneral")}
        >
          <span
            className={`debug-toggle ${
              expandedSections.learningGeneral ? "expanded" : ""
            }`}
          >
            ▶
          </span>
          <h3>Learning General Information</h3>
        </div>
        {expandedSections.learningGeneral && (
          <div className="debug-section-content">
            <div className="debug-info-grid">
              <div className="debug-info-item">
                <strong>Current Week ID:</strong>
                <span>{getCurrentWeekId()}</span>
              </div>
              <div className="debug-info-item">
                <strong>Current Week Display:</strong>
                <span>{getWeekDisplayString(getCurrentWeekId())}</span>
              </div>
              <div className="debug-info-item">
                <strong>Last Week ID:</strong>
                <span>{storeData.lastWeekId}</span>
              </div>
              <div className="debug-info-item">
                <strong>Current Topics Count:</strong>
                <span>{storeData.currentWeekTopics.length}</span>
              </div>
              <div className="debug-info-item">
                <strong>Total Topics:</strong>
                <span>
                  {countTopics(storeData.currentWeekTopics).total}
                </span>
              </div>
              <div className="debug-info-item">
                <strong>Blog Posts Written:</strong>
                <span>
                  {storeData.currentWeekTopics.reduce((count, topic) => {
                    return count + (topic.blogPost.written ? 1 : 0);
                  }, 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Week Learning Topics */}
      <div className="debug-section">
        <div
          className="debug-section-header"
          onClick={() => toggleSection("currentWeekTopics")}
        >
          <span
            className={`debug-toggle ${
              expandedSections.currentWeekTopics ? "expanded" : ""
            }`}
          >
            ▶
          </span>
          <h3>Current Week Topics ({storeData.currentWeekTopics.length})</h3>
        </div>
        {expandedSections.currentWeekTopics && (
          <div className="debug-section-content">
            {storeData.currentWeekTopics.length === 0 ? (
              <div className="debug-empty">
                No learning topics for current week
              </div>
            ) : (
              <div className="debug-tasks-list">
                {storeData.currentWeekTopics.map((topic) =>
                  renderLearningTopic(topic)
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Learning Settings */}
      <div className="debug-section">
        <div
          className="debug-section-header"
          onClick={() => toggleSection("learningSettings")}
        >
          <span
            className={`debug-toggle ${
              expandedSections.learningSettings ? "expanded" : ""
            }`}
          >
            ▶
          </span>
          <h3>Learning Settings</h3>
        </div>
        {expandedSections.learningSettings && (
          <div className="debug-section-content">
            <div className="debug-settings-grid">
              <div className="debug-setting-item">
                <strong>Auto Create New Week:</strong>
                <span
                  className={
                    storeData.learningSettings.autoCreateNewWeek
                      ? "enabled"
                      : "disabled"
                  }
                >
                  {storeData.learningSettings.autoCreateNewWeek
                    ? "Enabled"
                    : "Disabled"}
                </span>
              </div>
              <div className="debug-setting-item">
              <div className="debug-setting-item">
                <strong>Week Start Day:</strong>
                <span>
                  {storeData.learningSettings.weekStartDay} (Monday = 1)
                </span>
              </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Learning Statistics */}
      <div className="debug-section">
        <div
          className="debug-section-header"
          onClick={() => toggleSection("learningStatistics")}
        >
          <span
            className={`debug-toggle ${
              expandedSections.learningStatistics ? "expanded" : ""
            }`}
          >
            ▶
          </span>
          <h3>Learning Statistics</h3>
        </div>
        {expandedSections.learningStatistics && (
          <div className="debug-section-content">
            <div className="debug-settings-grid">
              <div className="debug-setting-item">
                <strong>Total Topics:</strong>
                <span>{storeData.learningStatistics.totalTopics}</span>
              </div>
              <div className="debug-setting-item">
                <strong>Total Blog Posts:</strong>
                <span>{storeData.learningStatistics.totalBlogPosts}</span>
              </div>
              <div className="debug-setting-item">
                <strong>Total Weeks:</strong>
                <span>{storeData.learningStatistics.totalWeeks}</span>
              </div>
              <div className="debug-setting-item">
                <strong>Current Week Streak:</strong>
                <span>{storeData.learningStatistics.currentWeekStreak}</span>
              </div>
              <div className="debug-setting-item">
                <strong>Longest Week Streak:</strong>
                <span>{storeData.learningStatistics.longestWeekStreak}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Learning History */}
      <div className="debug-section">
        <div
          className="debug-section-header"
          onClick={() => toggleSection("learningHistory")}
        >
          <span
            className={`debug-toggle ${
              expandedSections.learningHistory ? "expanded" : ""
            }`}
          >
            ▶
          </span>
          <h3>
            Learning History ({Object.keys(storeData.learningHistory).length}{" "}
            weeks)
          </h3>
        </div>
        {expandedSections.learningHistory && (
          <div className="debug-section-content">
            {Object.keys(storeData.learningHistory).length === 0 ? (
              <div className="debug-empty">No learning history entries</div>
            ) : (
              <div className="debug-history">
                {Object.entries(storeData.learningHistory)
                  .sort(([a], [b]) => b.localeCompare(a)) // Sort by week ID desc
                  .map(([weekId, entry]) => (
                    <div key={weekId} className="debug-history-entry">
                      <div className="debug-history-header">
                        <strong>{getWeekDisplayString(weekId)}</strong>
                        <span className="debug-history-stats">
                          {entry.topics.reduce(
                            (count, topic) =>
                              count + (topic.blogPost.written ? 1 : 0),
                            0
                          ) > 0 && (
                            <span className="debug-blog-count">
                              ,{" "}
                              {entry.topics.reduce(
                                (count, topic) =>
                                  count + (topic.blogPost.written ? 1 : 0),
                                0
                              )}{" "}
                              blog posts
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="debug-history-tasks">
                        {entry.topics.map((topic) =>
                          renderLearningTopic(topic)
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* JSON Editor */}
      <div className="debug-section debug-json-section">
        <div className="debug-section-header debug-json-header">
          <h3>JSON Editor {isEditing ? "(Editing)" : "(View Mode)"}</h3>
          <div className="debug-json-controls">
            {!isEditing ? (
              <>
                {/* <button
                  onClick={exportJson}
                  className="debug-export-btn"
                >
                  Export JSON
                </button> */}
                <button onClick={startEditing} className="debug-edit-btn">
                  Edit JSON
                </button>
              </>
            ) : (
              <div className="debug-edit-controls">
                <button
                  onClick={handleSaveClick}
                  disabled={saving}
                  className="debug-save-btn"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={cancelEditing}
                  disabled={saving}
                  className="debug-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="debug-section-content">
          {isEditing ? (
            <div className="debug-json-editor">
              <textarea
                value={editedJson}
                onChange={(e) => setEditedJson(e.target.value)}
                className="debug-json-textarea"
                rows={20}
                disabled={saving}
              />
              {jsonError && (
                <div className="debug-json-error">
                  <strong>JSON Error:</strong> {jsonError}
                </div>
              )}
              {validationErrors.length > 0 && (
                <div className="debug-validation-errors">
                  <strong>Validation Errors:</strong>
                  <ul>
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <details className="debug-json-details">
              <summary>Click to view raw JSON</summary>
              <pre className="debug-json">{formatJson(storeData)}</pre>
            </details>
          )}
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="debug-success-message">
          JSON data saved successfully!
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="debug-confirmation-overlay">
          <div className="debug-confirmation-modal">
            <h3>Confirm Save</h3>
            <p>
              This will replace ALL your current data with the edited JSON.
              <br />
              <strong>This action cannot be undone.</strong>
              <br />
              Are you sure you want to continue?
            </p>
            <div className="debug-confirmation-buttons">
              <button onClick={cancelSave} className="debug-confirm-cancel-btn">
                Cancel
              </button>
              <button onClick={confirmSave} className="debug-confirm-save-btn">
                Yes, Replace Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
