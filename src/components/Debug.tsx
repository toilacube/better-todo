import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { storage } from "../store/storage";
import { Task, TaskHistory, Settings } from "../types";
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
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedJson, setEditedJson] = useState<string>("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [todayTasks, mustDoTasks, taskHistory, lastDate, settings] =
        await Promise.all([
          storage.getTodayTasks(),
          storage.getMustDoTasks(),
          storage.getTaskHistory(),
          storage.getLastDate(),
          storage.getSettings(),
        ]);

      setStoreData({
        todayTasks,
        mustDoTasks,
        taskHistory,
        lastDate,
        settings,
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
  };

  const saveJson = async () => {
    try {
      setSaving(true);
      setJsonError(null);
      setValidationErrors([]);

      // Parse JSON
      let parsedData;
      try {
        parsedData = JSON.parse(editedJson);
      } catch (err) {
        setJsonError(
          `Invalid JSON: ${err instanceof Error ? err.message : "Parse error"}`
        );
        return;
      }

      // Validate data structure
      const errors = validateStoreData(parsedData);
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Save to storage
      await Promise.all([
        storage.setTodayTasks(parsedData.todayTasks),
        storage.setMustDoTasks(parsedData.mustDoTasks),
        storage.setTaskHistory(parsedData.taskHistory),
        storage.setLastDate(parsedData.lastDate),
        storage.setSettings(parsedData.settings),
      ]);

      // Reload data and exit editing mode
      await loadStoreData();
      setIsEditing(false);
      setEditedJson("");
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

      {/* JSON Editor */}
      <div className="debug-section debug-json-section">
        <div className="debug-section-header debug-json-header">
          <h3>JSON Editor {isEditing ? "(Editing)" : "(View Mode)"}</h3>
          <div className="debug-json-controls">
            {!isEditing ? (
              <button
                onClick={startEditing}
                className="debug-edit-btn"
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  padding: "10px 20px",
                }}
              >
                Edit JSON
              </button>
            ) : (
              <div className="debug-edit-controls">
                <button
                  onClick={saveJson}
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
    </div>
  );
}
