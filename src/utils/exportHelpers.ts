import { Task, ExportOptions, TaskHistory } from "../types";
import { formatDate, getTodayDateString } from "./dateHelpers";

/**
 * Format a single task as markdown bullet point
 * @param task - The task to format
 * @param depth - The indentation level (0 for root tasks)
 * @param includeSubtasks - Whether to include subtasks
 */
const formatTaskAsMarkdown = (
  task: Task,
  depth: number = 0,
  includeSubtasks: boolean = true
): string => {
  const indent = "  ".repeat(depth); // 2 spaces per level
  const bullet = depth === 0 ? "-" : "*"; // Use - for root, * for subtasks
  let markdown = `${indent}${bullet} ${task.text}\n`;

  if (includeSubtasks && task.subtasks.length > 0) {
    task.subtasks.forEach((subtask) => {
      markdown += formatTaskAsMarkdown(subtask, depth + 1, includeSubtasks);
    });
  }

  return markdown;
};

/**
 * Flatten all tasks including subtasks into a single array
 * @param tasks - Array of tasks to flatten
 */
const flattenTasks = (tasks: Task[]): Task[] => {
  const result: Task[] = [];

  const flatten = (taskList: Task[]) => {
    taskList.forEach((task) => {
      result.push(task);
      if (task.subtasks.length > 0) {
        flatten(task.subtasks);
      }
    });
  };

  flatten(tasks);
  return result;
};

/**
 * Group tasks by date based on their status
 * Completed tasks are grouped by finished_at, incomplete by created_at
 * @param tasks - Array of tasks to group
 * @param status - Filter by completion status
 * @param includeSubtasks - Whether to include subtasks as separate tasks
 */
const groupTasksByDate = (
  tasks: Task[],
  status: "all" | "completed" | "incomplete",
  includeSubtasks: boolean
): Map<string, Task[]> => {
  const tasksByDate = new Map<string, Task[]>();

  // Flatten all tasks if we're not including subtasks in the hierarchy
  // But we still need to filter them appropriately
  const allTasks = includeSubtasks ? flattenTasks(tasks) : tasks;

  allTasks.forEach((task) => {
    // Filter by status
    if (status === "completed" && !task.completed) return;
    if (status === "incomplete" && task.completed) return;

    // Determine which date to use
    let dateKey: string;
    if (task.completed && task.finished_at) {
      // Use finished_at date for completed tasks
      dateKey = new Date(task.finished_at).toDateString();
    } else {
      // Use created_at date for incomplete tasks
      dateKey = new Date(task.created_at).toDateString();
    }

    // Add task to the appropriate date group
    if (!tasksByDate.has(dateKey)) {
      tasksByDate.set(dateKey, []);
    }
    tasksByDate.get(dateKey)!.push(task);
  });

  return tasksByDate;
};

/**
 * Filter tasks by date range
 * @param tasksByDate - Map of tasks grouped by date
 * @param dateRange - Number of days to include, or "all" for all dates
 */
const filterByDateRange = (
  tasksByDate: Map<string, Task[]>,
  dateRange: number | "all"
): Map<string, Task[]> => {
  if (dateRange === "all") {
    return tasksByDate;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - dateRange + 1); // +1 to include today

  const filtered = new Map<string, Task[]>();

  tasksByDate.forEach((tasks, dateString) => {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);

    if (date >= cutoffDate) {
      filtered.set(dateString, tasks);
    }
  });

  return filtered;
};

/**
 * Generate markdown export from task history
 * @param taskHistory - The task history object
 * @param todayTasks - Current day tasks
 * @param options - Export options
 */
export const generateMarkdownExport = (
  taskHistory: TaskHistory,
  todayTasks: Task[],
  options: ExportOptions
): string => {
  let markdown = "# Task History Export\n\n";

  const todayDateString = getTodayDateString();
  const todayDate = new Date(todayDateString);
  todayDate.setHours(0, 0, 0, 0);

  // Group historical tasks (excluding today) by their completion/creation dates
  const allDates = Object.keys(taskHistory).filter(date => date !== todayDateString);
  const historicalTasks: Task[] = [];

  allDates.forEach((dateString) => {
    const entry = taskHistory[dateString];
    if (entry.tasks && entry.tasks.length > 0) {
      historicalTasks.push(...entry.tasks);
    }
  });

  // Group historical tasks by date based on completion status
  const tasksByDate = groupTasksByDate(
    historicalTasks,
    options.status,
    false // Don't flatten yet - we'll handle hierarchy in formatting
  );

  // Add today's tasks directly under today's date (without regrouping)
  if (todayTasks.length > 0) {
    // Filter today's tasks by status
    const filteredTodayTasks = todayTasks.filter((task) => {
      if (options.status === "completed") return task.completed;
      if (options.status === "incomplete") return !task.completed;
      return true; // "all"
    });

    if (filteredTodayTasks.length > 0) {
      tasksByDate.set(todayDate.toDateString(), filteredTodayTasks);
    }
  }

  // Filter by date range
  const filteredTasks = filterByDateRange(tasksByDate, options.dateRange);

  // Sort dates in descending order (most recent first)
  const sortedDates = Array.from(filteredTasks.keys()).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  if (sortedDates.length === 0) {
    markdown += "_No tasks found for the selected criteria._\n";
    return markdown;
  }

  // Generate markdown for each date
  sortedDates.forEach((dateString) => {
    const tasks = filteredTasks.get(dateString)!;

    // Format date as header
    markdown += `## ${formatDate(dateString)}\n\n`;

    // Format each task
    tasks.forEach((task) => {
      markdown += formatTaskAsMarkdown(task, 0, options.includeSubtasks);
    });

    markdown += "\n"; // Extra line between dates
  });

  return markdown;
};

/**
 * Download markdown content as a file
 * @param content - The markdown content to download
 * @param filename - Optional custom filename (without extension)
 */
export const downloadMarkdownFile = (
  content: string,
  filename?: string
): void => {
  const defaultFilename = `todo-history-${new Date().toISOString().split("T")[0]}.md`;
  const finalFilename = filename ? `${filename}.md` : defaultFilename;

  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
