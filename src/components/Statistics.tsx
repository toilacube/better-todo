import { useState } from "react";
import { ArrowLeft, Download, X } from "lucide-react";
import { motion } from "framer-motion";
import { HistoryEntry, Task, TaskHistory, ExportOptions } from "../types";
import { formatDate } from "../utils/dateHelpers";
import { countTasks, calculateTaskDuration } from "../utils/taskHelpers";
import { generateMarkdownExport, downloadMarkdownFile } from "../utils/exportHelpers";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TaskItem } from "./TaskItem";

type TimePeriod = 7 | 30 | 90 | "all";
type TaskFilter = "all" | "completed" | "incomplete";

interface StatisticsProps {
  history: HistoryEntry[];
  todayTasks: Task[];
  mustDoTasks: Task[];
  onBack: () => void;
}

export const Statistics: React.FC<StatisticsProps> = ({
  history,
  todayTasks,
  mustDoTasks,
  onBack,
}) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(30);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    status: "all",
    dateRange: 5,
    includeSubtasks: true,
  });

  // Filter history based on selected time period
  const getFilteredHistory = () => {
    if (timePeriod === "all") {
      return history;
    }
    return history.slice(0, timePeriod);
  };

  // Filter tasks by completion status
  const filterTasksByCompletion = (tasks: Task[]): Task[] => {
    if (taskFilter === "all") return tasks;
    if (taskFilter === "completed") {
      return tasks.filter((task) => task.completed);
    }
    return tasks.filter((task) => !task.completed);
  };

  const filteredHistory = getFilteredHistory().map((entry) => ({
    ...entry,
    tasks: filterTasksByCompletion(entry.tasks),
  }));

  // Calculate summary statistics from filtered history
  const totalStats = filteredHistory.reduce(
    (acc, entry) => {
      const counts = countTasks(entry.tasks);
      return {
        total: acc.total + counts.total,
        completed: acc.completed + counts.completed,
      };
    },
    { total: 0, completed: 0 }
  );

  const completionRate =
    totalStats.total > 0
      ? Math.round((totalStats.completed / totalStats.total) * 100)
      : 0;

  // 1. Stacked Bar Chart Data (Shows bars for the selected period)
  const barChartData = filteredHistory
    .slice()
    .reverse()
    .map((entry) => {
      const counts = countTasks(entry.tasks);
      return {
        date: formatDate(entry.date).split(" ").slice(0, 3).join(" "), // Format: "Mon Oct 06"
        completed: counts.completed,
        incomplete: counts.total - counts.completed,
      };
    });

  // 2. Pie Chart Data (Current Status - Today vs Must-Do)
  const todayCounts = countTasks(todayTasks);
  const mustDoCounts = countTasks(mustDoTasks);
  const currentStatusData = [
    { name: "Today Tasks", value: todayCounts.total, color: "#000000" },
    { name: "Must-Do Tasks", value: mustDoCounts.total, color: "#DC2626" },
  ];

  // 3. Line Chart Data (Productivity Trend for selected period)
  const productivityTrendData = filteredHistory
    .slice()
    .reverse()
    .map((entry, index) => {
      const counts = countTasks(entry.tasks);
      const rate =
        counts.total > 0 ? (counts.completed / counts.total) * 100 : 0;
      return {
        day: index + 1,
        date: formatDate(entry.date).split(" ").slice(0, 3).join(" "),
        completionRate: parseFloat(rate.toFixed(1)),
      };
    });

  // Calculate streaks
  const streaks = calculateStreaks(history);

  const STACKED_COLORS = {
    completed: "#10B981",
    incomplete: "#F59E0B",
  };

  // Export handler
  const handleExport = () => {
    // Reconstruct TaskHistory object from history array
    const taskHistory: TaskHistory = {};
    history.forEach((entry) => {
      taskHistory[entry.date] = entry;
    });

    const markdown = generateMarkdownExport(
      taskHistory,
      todayTasks,
      exportOptions
    );
    downloadMarkdownFile(markdown);
    setIsExportModalOpen(false);
  };

  return (
    <motion.div
      className="statistics-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="statistics-header">
        <motion.button
          onClick={onBack}
          className="back-button"
          whileHover={{ opacity: 1, x: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span>Back</span>
        </motion.button>
      </div>

      <div className="statistics-content">
        <div className="statistics-header-row">
          <h1 className="statistics-title">Statistics</h1>

          <div className="header-actions">
            {/* Time Period Selector */}
            <div className="time-period-selector">
              <button
                className={`period-button ${timePeriod === 7 ? "active" : ""}`}
                onClick={() => setTimePeriod(7)}
              >
                7 Days
              </button>
              <button
                className={`period-button ${timePeriod === 30 ? "active" : ""}`}
                onClick={() => setTimePeriod(30)}
              >
                30 Days
              </button>
              <button
                className={`period-button ${timePeriod === 90 ? "active" : ""}`}
                onClick={() => setTimePeriod(90)}
              >
                90 Days
              </button>
              <button
                className={`period-button ${
                  timePeriod === "all" ? "active" : ""
                }`}
                onClick={() => setTimePeriod("all")}
              >
                All Time
              </button>
            </div>

            {/* Export Button */}
            <motion.button
              className="export-button"
              onClick={() => setIsExportModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={18} strokeWidth={1.5} />
              <span>Export</span>
            </motion.button>
          </div>
        </div>

        {/* Task Filter */}
        <div className="task-filter-row">
          <span className="filter-label">Show:</span>
          <div className="task-filter-buttons">
            <button
              className={`filter-button ${taskFilter === "all" ? "active" : ""}`}
              onClick={() => setTaskFilter("all")}
            >
              All Tasks
            </button>
            <button
              className={`filter-button ${
                taskFilter === "completed" ? "active" : ""
              }`}
              onClick={() => setTaskFilter("completed")}
            >
              Completed
            </button>
            <button
              className={`filter-button ${
                taskFilter === "incomplete" ? "active" : ""
              }`}
              onClick={() => setTaskFilter("incomplete")}
            >
              Incomplete
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-value">
              {totalStats.total.toLocaleString()}
            </div>
            <div className="summary-label">Total Tasks</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">
              {totalStats.completed.toLocaleString()}
            </div>
            <div className="summary-label">Completed</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{completionRate}%</div>
            <div className="summary-label">Rate</div>
          </div>
        </div>

        {/* 1. Stacked Bar Chart - Completion Overview */}
        {barChartData.length > 0 && (
          <div className="chart-section">
            <h2 className="chart-title">
              Task Completion Overview (
              {timePeriod === "all" ? "All Time" : `Last ${timePeriod} Days`})
            </h2>
            <p className="chart-description">
              Comparing completed vs incomplete tasks across days
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="completed"
                  stackId="a"
                  fill={STACKED_COLORS.completed}
                  name="Completed"
                />
                <Bar
                  dataKey="incomplete"
                  stackId="a"
                  fill={STACKED_COLORS.incomplete}
                  name="Incomplete"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Charts Row: Pie Chart and Streaks */}
        <div className="charts-row">
          {/* 2. Pie Chart - Current Status */}
          <div className="chart-section">
            <h2 className="chart-title">Current Task Status</h2>
            <p className="chart-description">
              Proportion of your current task load
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={currentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCurrentStatusLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {currentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Streak Section */}
          <div className="chart-section">
            <h2 className="chart-title">Streak</h2>
            <div className="streak-container">
              <div className="streak-item">
                <div className="streak-icon">🔥</div>
                <div className="streak-value">{streaks.current} days</div>
                <div className="streak-label">Current</div>
              </div>
              <div className="streak-item">
                <div className="streak-icon">⭐</div>
                <div className="streak-value">{streaks.longest} days</div>
                <div className="streak-label">Best</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Line Chart - Productivity Trend */}
        {productivityTrendData.length > 0 && (
          <div className="chart-section">
            <h2 className="chart-title">
              Productivity Trend (
              {timePeriod === "all" ? "All Time" : `Last ${timePeriod} Days`})
            </h2>
            <p className="chart-description">
              Tracking your completion rate over time
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productivityTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="day"
                  label={{
                    value: "Days",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  label={{
                    value: "Completion Rate (%)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `${value}%`,
                    "Completion Rate",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completionRate"
                  stroke="#000000"
                  strokeWidth={2}
                  name="Completion Rate"
                  dot={{ fill: "#000000", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* History */}
        <div className="history-section">
          <h2 className="chart-title">History</h2>
          {filteredHistory.slice(0, 10).map((entry) => (
            <div key={entry.date} className="history-card">
              <div className="history-header">
                <span className="history-date">{formatDate(entry.date)}</span>
                <span className="history-count">
                  [{entry.completed}/{entry.total}]
                </span>
              </div>
              <div className="history-tasks">
                {entry.tasks.map((task) => (
                  <div key={task.id} className="history-task-wrapper">
                    <TaskItem
                      task={task}
                      onToggle={() => {}}
                      onDelete={() => {}}
                      onAddSubtask={() => {}}
                      onToggleExpand={() => {}}
                      onUpdateText={() => {}}
                    />
                    <div className="task-metadata">
                      {task.created_at && (
                        <span className="task-timestamp">
                          Created: {formatTimestamp(task.created_at)}
                        </span>
                      )}
                      {task.finished_at && (
                        <span className="task-timestamp">
                          Finished: {formatTimestamp(task.finished_at)}
                        </span>
                      )}
                      {task.finished_at && task.created_at && (
                        <span className="task-duration">
                          Duration: {formatDuration(calculateTaskDuration(task))}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsExportModalOpen(false)}
        >
          <motion.div
            className="export-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Export Task History</h2>
              <button
                className="modal-close"
                onClick={() => setIsExportModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Status Filter */}
              <div className="export-option">
                <label className="export-label">Task Status</label>
                <div className="export-radio-group">
                  <label className="export-radio">
                    <input
                      type="radio"
                      name="status"
                      value="all"
                      checked={exportOptions.status === "all"}
                      onChange={(e) =>
                        setExportOptions({
                          ...exportOptions,
                          status: e.target.value as "all" | "completed" | "incomplete",
                        })
                      }
                    />
                    <span>All Tasks</span>
                  </label>
                  <label className="export-radio">
                    <input
                      type="radio"
                      name="status"
                      value="completed"
                      checked={exportOptions.status === "completed"}
                      onChange={(e) =>
                        setExportOptions({
                          ...exportOptions,
                          status: e.target.value as "all" | "completed" | "incomplete",
                        })
                      }
                    />
                    <span>Completed Only</span>
                  </label>
                  <label className="export-radio">
                    <input
                      type="radio"
                      name="status"
                      value="incomplete"
                      checked={exportOptions.status === "incomplete"}
                      onChange={(e) =>
                        setExportOptions({
                          ...exportOptions,
                          status: e.target.value as "all" | "completed" | "incomplete",
                        })
                      }
                    />
                    <span>Incomplete Only</span>
                  </label>
                </div>
              </div>

              {/* Date Range */}
              <div className="export-option">
                <label className="export-label">Date Range</label>
                <select
                  className="export-select"
                  value={exportOptions.dateRange}
                  onChange={(e) =>
                    setExportOptions({
                      ...exportOptions,
                      dateRange: e.target.value === "all" ? "all" : parseInt(e.target.value) as 5 | 7 | 14 | 30,
                    })
                  }
                >
                  <option value="5">Last 5 days (default)</option>
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="all">All time</option>
                </select>
              </div>

              {/* Include Subtasks */}
              <div className="export-option">
                <label className="export-checkbox">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeSubtasks}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        includeSubtasks: e.target.checked,
                      })
                    }
                  />
                  <span>Include subtasks</span>
                </label>
                <p className="export-hint">
                  Subtasks will be shown as indented bullet points under their parent tasks
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-button modal-button-cancel"
                onClick={() => setIsExportModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="modal-button modal-button-primary"
                onClick={handleExport}
              >
                <Download size={16} />
                Export as Markdown
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Helper function for pie chart labels
const renderCurrentStatusLabel = (entry: any) => {
  return `${entry.name}: ${entry.value}`;
};

// Format ISO timestamp to readable format
const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format duration in milliseconds to readable format
const formatDuration = (milliseconds: number | null): string => {
  if (!milliseconds) return "N/A";

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
};

// Calculate streaks
const calculateStreaks = (
  history: HistoryEntry[]
): { current: number; longest: number } => {
  let current = 0;
  let longest = 0;
  let temp = 0;

  // Sort by date descending
  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    const counts = countTasks(entry.tasks);
    const rate = counts.total > 0 ? counts.completed / counts.total : 0;

    if (rate === 1) {
      temp++;
      if (i === 0) current = temp;
      if (temp > longest) longest = temp;
    } else {
      if (i === 0) current = 0;
      temp = 0;
    }
  }

  return { current, longest };
};
