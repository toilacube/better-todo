// Core types for the Todo application

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  subtasks: Task[];
  expanded: boolean;
  created_at: string; // ISO 8601 timestamp
  finished_at?: string; // ISO 8601 timestamp, set when task and all subtasks are completed
}

export interface HistoryEntry {
  date: string;
  tasks: Task[];
  completed: number;
  total: number;
}

export interface Settings {
  autoCarryOver: boolean;
  notifyInterval: number; // in hours
  darkMode: boolean;
  autoStart: boolean;
}

export interface TaskHistory {
  [dateString: string]: HistoryEntry;
}

export interface ExportOptions {
  status: "all" | "completed" | "incomplete";
  dateRange: 5 | 7 | 14 | 30 | "all";
  includeSubtasks: boolean;
}

export type TabType = "today" | "mustDo" | "learning";

export interface AppState {
  todayTasks: Task[];
  mustDoTasks: Task[];
  taskHistory: TaskHistory;
  lastDate: string;
  settings: Settings;
}

// ==========================================
// Learning Tracker Types
// ==========================================

export interface ReferenceLink {
  id: number;
  url: string;
}

export interface LearningTopic {
  id: number;
  title: string;
  notes: string; // Markdown content
  referenceLinks: ReferenceLink[];
  subtopics: LearningTopic[]; // Recursive structure
  expanded: boolean; // UI state
  blogPost: {
    written: boolean;
    url?: string;
  };
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

export interface WeeklyLearningEntry {
  weekId: string; // Format: "YYYY-Www" (e.g., "2025-W42")
  weekStart: string; // ISO date of Monday
  weekEnd: string; // ISO date of Sunday
  topics: LearningTopic[];
  total: number; // Total topics (including subtopics)
}

export interface LearningHistory {
  [weekId: string]: WeeklyLearningEntry;
}

export interface LearningStatistics {
  totalTopics: number;
  totalBlogPosts: number;
  totalWeeks: number;
  currentWeekStreak: number;
  longestWeekStreak: number;
  topicsByMonth: {
    [monthId: string]: {
      total: number;
      completed: number;
    };
  };
  topicsByWeek: {
    [weekId: string]: {
      total: number;
      completed: number;
      blogPosts: number;
    };
  };
}

export interface LearningSettings {
  autoCreateNewWeek: boolean;
  weekStartDay: 1; // 1 = Monday (ISO standard)
}

export type LearningViewType = "topics" | "history" | "statistics";
