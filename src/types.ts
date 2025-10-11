// Core types for the Todo application

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  subtasks: Task[];
  expanded: boolean;
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

export type TabType = "today" | "mustDo";

export interface AppState {
  todayTasks: Task[];
  mustDoTasks: Task[];
  taskHistory: TaskHistory;
  lastDate: string;
  settings: Settings;
}
