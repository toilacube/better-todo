import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { HistoryEntry } from "../types";
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
} from "recharts";
import { TaskItem } from "./TaskItem";

interface StatisticsProps {
  history: HistoryEntry[];
  onBack: () => void;
}

export const Statistics: React.FC<StatisticsProps> = ({ history, onBack }) => {
  // Calculate summary statistics
  const totalStats = history.reduce(
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

  // Prepare data for charts (last 30 days)
  const last30Days = history.slice(0, 30).reverse();

  const trendData = last30Days.map((entry, index) => {
    const counts = countTasks(entry.tasks);
    return {
      day: index + 1,
      completed: counts.completed,
      total: counts.total,
    };
  });

  const rateData = last30Days.map((entry, index) => {
    const counts = countTasks(entry.tasks);
    const rate = counts.total > 0 ? (counts.completed / counts.total) * 100 : 0;
    return {
      day: index + 1,
      rate: Math.round(rate),
    };
  });

  const pieData = [
    { name: "Completed", value: totalStats.completed },
    { name: "Pending", value: totalStats.total - totalStats.completed },
  ];

  // Calculate streaks
  const streaks = calculateStreaks(history);

  const COLORS = ["#000000", "#9CA3AF"];

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
        <h1 className="statistics-title">Statistics</h1>

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

        {/* Trend Chart */}
        {trendData.length > 0 && (
          <div className="chart-section">
            <h2 className="chart-title">Completion Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#000000"
                  strokeWidth={2}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#9CA3AF"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Rate Bar Chart */}
        {rateData.length > 0 && (
          <div className="chart-section">
            <h2 className="chart-title">Completion Rate</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={rateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rate" fill="#000000" name="Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pie Chart and Streaks */}
        <div className="charts-row">
          <div className="chart-section">
            <h2 className="chart-title">Distribution</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

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

        {/* History */}
        <div className="history-section">
          <h2 className="chart-title">History</h2>
          {history.slice(0, 10).map((entry) => (
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
const renderLabel = (entry: any) => {
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
