import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { HistoryEntry, Task } from "../types";
import { formatDate } from "../utils/dateHelpers";
import { countTasks } from "../utils/taskHelpers";
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
  onBack
}) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(30);

  // Filter history based on selected time period
  const getFilteredHistory = () => {
    if (timePeriod === "all") {
      return history;
    }
    return history.slice(0, timePeriod);
  };

  const filteredHistory = getFilteredHistory();

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
  const barChartData = filteredHistory.slice().reverse().map((entry) => {
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
  const productivityTrendData = filteredHistory.slice().reverse().map((entry, index) => {
    const counts = countTasks(entry.tasks);
    const rate = counts.total > 0 ? (counts.completed / counts.total) * 100 : 0;
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
              className={`period-button ${timePeriod === "all" ? "active" : ""}`}
              onClick={() => setTimePeriod("all")}
            >
              All Time
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
              Task Completion Overview ({timePeriod === "all" ? "All Time" : `Last ${timePeriod} Days`})
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
              Productivity Trend ({timePeriod === "all" ? "All Time" : `Last ${timePeriod} Days`})
            </h2>
            <p className="chart-description">
              Tracking your completion rate over time
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productivityTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" label={{ value: "Days", position: "insideBottom", offset: -5 }} />
                <YAxis label={{ value: "Completion Rate (%)", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Completion Rate"]}
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
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => {}}
                    onDelete={() => {}}
                    onAddSubtask={() => {}}
                    onToggleExpand={() => {}}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Helper function for pie chart labels
const renderCurrentStatusLabel = (entry: any) => {
  return `${entry.name}: ${entry.value}`;
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
